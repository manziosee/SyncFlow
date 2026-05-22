defmodule SyncFlow.Accounting.Schema.LedgerEntry do
  use Ecto.Schema
  @derive {Jason.Encoder, except: [:__meta__]}

  @primary_key {:id, :binary_id, autogenerate: false}

  schema "ledger_entries" do
    field :org_id, :binary_id
    field :invoice_id, :binary_id
    field :type, Ecto.Enum, values: [:accounts_receivable, :revenue, :tax, :payment, :adjustment]
    field :description, :string
    field :amount, :decimal
    field :direction, Ecto.Enum, values: [:debit, :credit]
    field :account_code, :string
    field :posted_at, :utc_datetime
    field :metadata, :map, default: %{}

    timestamps(type: :utc_datetime)
  end
end
