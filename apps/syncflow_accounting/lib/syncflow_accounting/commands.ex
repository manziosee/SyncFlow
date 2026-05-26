defmodule SyncFlow.Accounting.Commands do
  defmodule CreateInvoice do
    @derive Jason.Encoder
    defstruct [
      :invoice_id,
      :org_id,
      :customer_id,
      :customer_name,
      :customer_email,
      :currency,
      :due_date,
      :lines,
      :notes,
      :created_by
    ]
  end

  defmodule UpdateInvoiceField do
    @derive Jason.Encoder
    defstruct [:invoice_id, :field, :value, :updated_by, :cursor_id]
  end

  defmodule AddInvoiceLine do
    @derive Jason.Encoder
    defstruct [:invoice_id, :line, :added_by]
  end

  defmodule RemoveInvoiceLine do
    @derive Jason.Encoder
    defstruct [:invoice_id, :line_id, :removed_by]
  end

  defmodule SubmitInvoiceForApproval do
    @derive Jason.Encoder
    defstruct [:invoice_id, :submitted_by]
  end

  defmodule ApproveInvoice do
    @derive Jason.Encoder
    defstruct [:invoice_id, :approved_by, :notes]
  end

  defmodule RejectInvoice do
    @derive Jason.Encoder
    defstruct [:invoice_id, :rejected_by, :reason]
  end

  defmodule VoidInvoice do
    @derive Jason.Encoder
    defstruct [:invoice_id, :voided_by, :reason]
  end
end
