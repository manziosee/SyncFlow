defmodule SyncFlow.Accounting.Projectors.InvoiceProjector do
  @moduledoc """
  Listens to invoice domain events and updates the read-model (postgres projections).
  Also broadcasts to Phoenix PubSub so channels can push updates to connected clients.
  """

  use Commanded.Projections.Ecto,
    application: SyncFlow.Core.CommandedApp,
    repo: SyncFlow.Accounting.Repo,
    name: "invoice_projector",
    consistency: :strong

  alias SyncFlow.Accounting.Events
  alias SyncFlow.Accounting.Schema.Invoice

  project(%Events.InvoiceCreated{} = evt, _metadata, fn multi ->
    invoice = %Invoice{
      id: evt.invoice_id,
      org_id: evt.org_id,
      customer_id: evt.customer_id,
      customer_name: evt.customer_name,
      currency: evt.currency,
      due_date: evt.due_date,
      lines: evt.lines || [],
      notes: evt.notes,
      status: :draft,
      created_by: evt.created_by,
      issued_date: Date.utc_today()
    }

    Ecto.Multi.insert(multi, :invoice, invoice)
  end)

  project(%Events.InvoiceFieldUpdated{} = evt, _metadata, fn multi ->
    Ecto.Multi.update_all(multi, :invoice, fn _ ->
      from(i in Invoice,
        where: i.id == ^evt.invoice_id,
        update: [set: [{^String.to_existing_atom(evt.field), ^evt.new_value}]]
      )
    end, [])
  end)

  project(%Events.InvoiceLineAdded{} = evt, _metadata, fn multi ->
    Ecto.Multi.run(multi, :add_line, fn repo, _ ->
      invoice = repo.get!(Invoice, evt.invoice_id)
      new_lines = invoice.lines ++ [evt.line]

      invoice
      |> Ecto.Changeset.change(lines: new_lines)
      |> repo.update()
    end)
  end)

  project(%Events.InvoiceLineRemoved{} = evt, _metadata, fn multi ->
    Ecto.Multi.run(multi, :remove_line, fn repo, _ ->
      invoice = repo.get!(Invoice, evt.invoice_id)
      new_lines = Enum.reject(invoice.lines, &(&1["id"] == evt.line_id))

      invoice
      |> Ecto.Changeset.change(lines: new_lines)
      |> repo.update()
    end)
  end)

  project(%Events.InvoiceSubmittedForApproval{} = evt, _metadata, fn multi ->
    Ecto.Multi.update_all(multi, :invoice,
      from(i in Invoice, where: i.id == ^evt.invoice_id),
      set: [status: :pending_approval, total_amount: evt.total_amount]
    )
  end)

  project(%Events.InvoiceApproved{} = evt, _metadata, fn multi ->
    Ecto.Multi.update_all(multi, :invoice,
      from(i in Invoice, where: i.id == ^evt.invoice_id),
      set: [status: :approved, approved_by: evt.approved_by, approved_at: evt.approved_at]
    )
  end)

  project(%Events.InvoiceRejected{} = evt, _metadata, fn multi ->
    Ecto.Multi.update_all(multi, :invoice,
      from(i in Invoice, where: i.id == ^evt.invoice_id),
      set: [status: :rejected, rejected_by: evt.rejected_by, rejection_reason: evt.reason]
    )
  end)

  project(%Events.InvoiceVoided{} = evt, _metadata, fn multi ->
    Ecto.Multi.update_all(multi, :invoice,
      from(i in Invoice, where: i.id == ^evt.invoice_id),
      set: [status: :voided]
    )
  end)

  @impl true
  def after_update(event, _metadata, _changes) do
    broadcast_event(event)
    :ok
  end

  defp broadcast_event(%Events.InvoiceCreated{} = evt) do
    Phoenix.PubSub.broadcast(SyncFlow.PubSub, "org:#{evt.org_id}:invoices", {:invoice_created, evt})
  end

  defp broadcast_event(%Events.InvoiceFieldUpdated{} = evt) do
    Phoenix.PubSub.broadcast(SyncFlow.PubSub, "invoice:#{evt.invoice_id}", {:field_updated, evt})
  end

  defp broadcast_event(%Events.InvoiceLineAdded{} = evt) do
    Phoenix.PubSub.broadcast(SyncFlow.PubSub, "invoice:#{evt.invoice_id}", {:line_added, evt})
  end

  defp broadcast_event(%Events.InvoiceLineRemoved{} = evt) do
    Phoenix.PubSub.broadcast(SyncFlow.PubSub, "invoice:#{evt.invoice_id}", {:line_removed, evt})
  end

  defp broadcast_event(%Events.InvoiceSubmittedForApproval{} = evt) do
    Phoenix.PubSub.broadcast(SyncFlow.PubSub, "invoice:#{evt.invoice_id}", {:status_changed, :pending_approval, evt})
  end

  defp broadcast_event(%Events.InvoiceApproved{} = evt) do
    Phoenix.PubSub.broadcast(SyncFlow.PubSub, "invoice:#{evt.invoice_id}", {:status_changed, :approved, evt})
  end

  defp broadcast_event(evt) do
    Phoenix.PubSub.broadcast(SyncFlow.PubSub, "invoice:#{evt.invoice_id}", {:invoice_event, evt})
  end
end
