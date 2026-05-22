defmodule SyncFlow.Accounting.Schema.Invoice do
  use Ecto.Schema
  @derive {Jason.Encoder, except: [:__meta__]}
  import Ecto.Changeset

  @statuses ~w(draft pending_approval approved rejected voided paid)a

  @primary_key {:id, :binary_id, autogenerate: false}

  schema "invoices" do
    field :org_id, :binary_id
    field :invoice_number, :string
    field :customer_id, :binary_id
    field :customer_name, :string
    field :customer_email, :string
    field :currency, :string, default: "RWF"
    field :status, Ecto.Enum, values: @statuses, default: :draft
    field :due_date, :date
    field :issued_date, :date
    field :lines, {:array, :map}, default: []
    field :subtotal, :decimal, default: Decimal.new("0")
    field :tax_total, :decimal, default: Decimal.new("0")
    field :total_amount, :decimal, default: Decimal.new("0")
    field :paid_amount, :decimal, default: Decimal.new("0")
    field :notes, :string
    field :terms, :string
    field :created_by, :binary_id
    field :approved_by, :binary_id
    field :approved_at, :utc_datetime
    field :rejected_by, :binary_id
    field :rejection_reason, :string
    field :metadata, :map, default: %{}

    timestamps(type: :utc_datetime)
  end

  def changeset(invoice, attrs) do
    invoice
    |> cast(attrs, [:id, :org_id, :invoice_number, :customer_id, :customer_name,
                    :customer_email, :currency, :status, :due_date, :issued_date,
                    :lines, :subtotal, :tax_total, :total_amount, :paid_amount,
                    :notes, :terms, :created_by, :approved_by, :approved_at,
                    :rejected_by, :rejection_reason, :metadata])
    |> validate_required([:id, :org_id, :customer_id, :currency, :status])
    |> unique_constraint(:invoice_number, name: :invoices_invoice_number_org_id_index)
  end
end
