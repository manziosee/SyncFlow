defmodule SyncFlow.Accounting.Aggregates.Invoice do
  @moduledoc """
  Invoice aggregate — enforces business rules for the invoice lifecycle.
  Collaborative editing is handled via UpdateInvoiceField commands which
  are OT-safe (last writer wins per field, with cursor tracking).
  """

  alias SyncFlow.Accounting.Commands
  alias SyncFlow.Accounting.Events

  defstruct [
    :invoice_id,
    :org_id,
    :customer_id,
    :status,
    :currency,
    :lines,
    :total_amount,
    :editors
  ]

  # --- Command handlers ---

  def execute(%__MODULE__{invoice_id: nil}, %Commands.CreateInvoice{} = cmd) do
    %Events.InvoiceCreated{
      invoice_id: cmd.invoice_id,
      org_id: cmd.org_id,
      customer_id: cmd.customer_id,
      customer_name: cmd.customer_name,
      customer_email: cmd.customer_email,
      currency: cmd.currency || "RWF",
      due_date: cmd.due_date,
      lines: cmd.lines || [],
      notes: cmd.notes,
      created_by: cmd.created_by,
      created_at: DateTime.utc_now()
    }
  end

  def execute(%__MODULE__{invoice_id: nil}, _cmd),
    do: {:error, :invoice_not_found}

  def execute(%__MODULE__{status: s}, %Commands.UpdateInvoiceField{})
      when s not in [:draft],
      do: {:error, :invoice_not_editable}

  def execute(%__MODULE__{} = inv, %Commands.UpdateInvoiceField{} = cmd) do
    current = Map.get(inv, String.to_existing_atom(cmd.field))

    %Events.InvoiceFieldUpdated{
      invoice_id: inv.invoice_id,
      field: cmd.field,
      old_value: current,
      new_value: cmd.value,
      updated_by: cmd.updated_by,
      cursor_id: cmd.cursor_id,
      updated_at: DateTime.utc_now()
    }
  end

  def execute(%__MODULE__{} = inv, %Commands.AddInvoiceLine{} = cmd) do
    %Events.InvoiceLineAdded{
      invoice_id: inv.invoice_id,
      line: Map.put(cmd.line, "id", UUID.uuid4()),
      added_by: cmd.added_by,
      added_at: DateTime.utc_now()
    }
  end

  def execute(%__MODULE__{} = inv, %Commands.RemoveInvoiceLine{} = cmd) do
    case Enum.find(inv.lines, &(&1["id"] == cmd.line_id)) do
      nil -> {:error, :line_not_found}
      _ ->
        %Events.InvoiceLineRemoved{
          invoice_id: inv.invoice_id,
          line_id: cmd.line_id,
          removed_by: cmd.removed_by,
          removed_at: DateTime.utc_now()
        }
    end
  end

  def execute(%__MODULE__{status: :draft} = inv, %Commands.SubmitInvoiceForApproval{} = cmd) do
    %Events.InvoiceSubmittedForApproval{
      invoice_id: inv.invoice_id,
      submitted_by: cmd.submitted_by,
      submitted_at: DateTime.utc_now(),
      total_amount: calculate_total(inv.lines)
    }
  end

  def execute(%__MODULE__{status: :pending_approval} = inv, %Commands.ApproveInvoice{} = cmd) do
    %Events.InvoiceApproved{
      invoice_id: inv.invoice_id,
      approved_by: cmd.approved_by,
      notes: cmd.notes,
      approved_at: DateTime.utc_now()
    }
  end

  def execute(%__MODULE__{status: :pending_approval} = inv, %Commands.RejectInvoice{} = cmd) do
    %Events.InvoiceRejected{
      invoice_id: inv.invoice_id,
      rejected_by: cmd.rejected_by,
      reason: cmd.reason,
      rejected_at: DateTime.utc_now()
    }
  end

  def execute(%__MODULE__{status: s} = inv, %Commands.VoidInvoice{} = cmd)
      when s in [:draft, :pending_approval, :approved] do
    %Events.InvoiceVoided{
      invoice_id: inv.invoice_id,
      voided_by: cmd.voided_by,
      reason: cmd.reason,
      voided_at: DateTime.utc_now()
    }
  end

  def execute(_, _), do: {:error, :invalid_command_for_state}

  # --- State evolution ---

  def apply(%__MODULE__{} = inv, %Events.InvoiceCreated{} = evt) do
    %{inv |
      invoice_id: evt.invoice_id,
      org_id: evt.org_id,
      customer_id: evt.customer_id,
      status: :draft,
      currency: evt.currency,
      lines: evt.lines || [],
      editors: []
    }
  end

  def apply(%__MODULE__{} = inv, %Events.InvoiceFieldUpdated{} = evt) do
    field_atom = String.to_existing_atom(evt.field)
    Map.put(inv, field_atom, evt.new_value)
  end

  def apply(%__MODULE__{lines: lines} = inv, %Events.InvoiceLineAdded{line: line}) do
    %{inv | lines: lines ++ [line]}
  end

  def apply(%__MODULE__{lines: lines} = inv, %Events.InvoiceLineRemoved{line_id: id}) do
    %{inv | lines: Enum.reject(lines, &(&1["id"] == id))}
  end

  def apply(%__MODULE__{} = inv, %Events.InvoiceSubmittedForApproval{total_amount: total}) do
    %{inv | status: :pending_approval, total_amount: total}
  end

  def apply(%__MODULE__{} = inv, %Events.InvoiceApproved{}) do
    %{inv | status: :approved}
  end

  def apply(%__MODULE__{} = inv, %Events.InvoiceRejected{}) do
    %{inv | status: :rejected}
  end

  def apply(%__MODULE__{} = inv, %Events.InvoiceVoided{}) do
    %{inv | status: :voided}
  end

  # --- Private helpers ---

  defp calculate_total(lines) when is_list(lines) do
    Enum.reduce(lines, Decimal.new("0"), fn line, acc ->
      qty = Decimal.new(to_string(line["quantity"] || 0))
      price = Decimal.new(to_string(line["unit_price"] || 0))
      tax_rate = Decimal.new(to_string(line["tax_rate"] || 0))
      subtotal = Decimal.mult(qty, price)
      tax = Decimal.mult(subtotal, Decimal.div(tax_rate, Decimal.new("100")))
      Decimal.add(acc, Decimal.add(subtotal, tax))
    end)
  end

  defp calculate_total(_), do: Decimal.new("0")
end
