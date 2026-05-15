defmodule SyncFlow.Accounting.Events do
  defmodule InvoiceCreated do
    @derive Jason.Encoder
    defstruct [
      :invoice_id, :org_id, :customer_id, :customer_name,
      :currency, :due_date, :lines, :notes, :created_by, :created_at
    ]
  end

  defmodule InvoiceFieldUpdated do
    @derive Jason.Encoder
    # field = atom key of the invoice being edited (supports collaborative editing)
    defstruct [:invoice_id, :field, :old_value, :new_value, :updated_by, :cursor_id, :updated_at]
  end

  defmodule InvoiceLineAdded do
    @derive Jason.Encoder
    defstruct [:invoice_id, :line, :added_by, :added_at]
  end

  defmodule InvoiceLineRemoved do
    @derive Jason.Encoder
    defstruct [:invoice_id, :line_id, :removed_by, :removed_at]
  end

  defmodule InvoiceSubmittedForApproval do
    @derive Jason.Encoder
    defstruct [:invoice_id, :submitted_by, :submitted_at, :total_amount]
  end

  defmodule InvoiceApproved do
    @derive Jason.Encoder
    defstruct [:invoice_id, :approved_by, :notes, :approved_at]
  end

  defmodule InvoiceRejected do
    @derive Jason.Encoder
    defstruct [:invoice_id, :rejected_by, :reason, :rejected_at]
  end

  defmodule InvoiceVoided do
    @derive Jason.Encoder
    defstruct [:invoice_id, :voided_by, :reason, :voided_at]
  end
end
