defmodule SyncFlow.Web.Channels.InvoiceChannel do
  @moduledoc """
  Multiplayer invoice editing channel.
  Multiple users can edit the same invoice concurrently — changes are broadcast
  to all connected clients so the UI stays in sync (Google Docs style).
  """

  use Phoenix.Channel
  alias SyncFlow.Web.Presence
  alias SyncFlow.Core.CommandedApp
  alias SyncFlow.Accounting.Commands
  alias SyncFlow.Accounting.Queries

  def join("invoice:" <> invoice_id, _params, socket) do
    socket = assign(socket, :invoice_id, invoice_id)

    send(self(), :after_join)

    {:ok, %{invoice_id: invoice_id}, socket}
  end

  def handle_info(:after_join, socket) do
    invoice_id = socket.assigns.invoice_id
    user_id = socket.assigns.user_id

    # Track user presence on this invoice (collaborative cursor)
    {:ok, _} =
      Presence.track(socket, user_id, %{
        name: socket.assigns.user_name,
        role: socket.assigns.role,
        cursor: nil,
        joined_at: DateTime.utc_now() |> DateTime.to_iso8601()
      })

    # Push current presence list to joining user
    push(socket, "presence_state", Presence.list(socket))

    # Subscribe to PubSub for this invoice
    Phoenix.PubSub.subscribe(SyncFlow.PubSub, "invoice:#{invoice_id}")

    # Send current invoice snapshot
    case Queries.get_invoice(invoice_id) do
      nil -> {:noreply, socket}
      invoice -> push(socket, "invoice_snapshot", format_invoice(invoice)); {:noreply, socket}
    end
  end

  # User updates a single field
  def handle_in("update_field", %{"field" => field, "value" => value} = params, socket) do
    cmd = %Commands.UpdateInvoiceField{
      invoice_id: socket.assigns.invoice_id,
      field: field,
      value: value,
      updated_by: socket.assigns.user_id,
      cursor_id: params["cursor_id"]
    }

    case CommandedApp.dispatch(cmd) do
      :ok ->
        broadcast!(socket, "field_updated", %{
          field: field,
          value: value,
          updated_by: socket.assigns.user_id,
          user_name: socket.assigns.user_name
        })

        {:reply, :ok, socket}

      {:error, reason} ->
        {:reply, {:error, %{reason: to_string(reason)}}, socket}
    end
  end

  # User moves cursor (broadcast to others, not stored)
  def handle_in("cursor_move", %{"x" => x, "y" => y, "field" => field}, socket) do
    broadcast_from!(socket, "cursor_moved", %{
      user_id: socket.assigns.user_id,
      user_name: socket.assigns.user_name,
      x: x,
      y: y,
      field: field
    })

    {:noreply, socket}
  end

  # Add invoice line
  def handle_in("add_line", %{"line" => line}, socket) do
    cmd = %Commands.AddInvoiceLine{
      invoice_id: socket.assigns.invoice_id,
      line: line,
      added_by: socket.assigns.user_id
    }

    case CommandedApp.dispatch(cmd) do
      :ok -> {:reply, :ok, socket}
      {:error, reason} -> {:reply, {:error, %{reason: to_string(reason)}}, socket}
    end
  end

  # Remove invoice line
  def handle_in("remove_line", %{"line_id" => line_id}, socket) do
    cmd = %Commands.RemoveInvoiceLine{
      invoice_id: socket.assigns.invoice_id,
      line_id: line_id,
      removed_by: socket.assigns.user_id
    }

    case CommandedApp.dispatch(cmd) do
      :ok -> {:reply, :ok, socket}
      {:error, reason} -> {:reply, {:error, %{reason: to_string(reason)}}, socket}
    end
  end

  # Submit for approval
  def handle_in("submit_for_approval", _params, socket) do
    cmd = %Commands.SubmitInvoiceForApproval{
      invoice_id: socket.assigns.invoice_id,
      submitted_by: socket.assigns.user_id
    }

    case CommandedApp.dispatch(cmd) do
      :ok -> {:reply, :ok, socket}
      {:error, reason} -> {:reply, {:error, %{reason: to_string(reason)}}, socket}
    end
  end

  # Receive PubSub broadcast and forward to channel clients
  def handle_info({:field_updated, event}, socket) do
    push(socket, "field_updated", %{
      field: event.field,
      value: event.new_value,
      updated_by: event.updated_by
    })

    {:noreply, socket}
  end

  def handle_info({:line_added, event}, socket) do
    push(socket, "line_added", %{line: event.line})
    {:noreply, socket}
  end

  def handle_info({:line_removed, event}, socket) do
    push(socket, "line_removed", %{line_id: event.line_id})
    {:noreply, socket}
  end

  def handle_info({:status_changed, status, _event}, socket) do
    push(socket, "status_changed", %{status: status})
    {:noreply, socket}
  end

  def handle_info(_, socket), do: {:noreply, socket}

  defp format_invoice(invoice) do
    %{
      id: invoice.id,
      invoice_number: invoice.invoice_number,
      customer_id: invoice.customer_id,
      customer_name: invoice.customer_name,
      currency: invoice.currency,
      status: invoice.status,
      due_date: invoice.due_date,
      lines: invoice.lines,
      total_amount: invoice.total_amount,
      notes: invoice.notes
    }
  end
end
