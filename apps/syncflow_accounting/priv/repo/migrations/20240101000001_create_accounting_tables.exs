defmodule SyncFlow.Accounting.Repo.Migrations.CreateAccountingTables do
  use Ecto.Migration

  def change do
    # Invoices (read model / projection)
    create table(:invoices, primary_key: false) do
      add :id, :binary_id, primary_key: true
      add :org_id, :binary_id, null: false
      add :invoice_number, :string
      add :customer_id, :binary_id
      add :customer_name, :string
      add :customer_email, :string
      add :currency, :string, default: "RWF"
      add :status, :string, default: "draft"
      add :due_date, :date
      add :issued_date, :date
      add :lines, :jsonb, default: "[]"
      add :subtotal, :decimal, precision: 15, scale: 2, default: 0
      add :tax_total, :decimal, precision: 15, scale: 2, default: 0
      add :total_amount, :decimal, precision: 15, scale: 2, default: 0
      add :paid_amount, :decimal, precision: 15, scale: 2, default: 0
      add :notes, :text
      add :terms, :text
      add :created_by, :binary_id
      add :approved_by, :binary_id
      add :approved_at, :utc_datetime
      add :rejected_by, :binary_id
      add :rejection_reason, :text
      add :metadata, :jsonb, default: "{}"

      timestamps(type: :utc_datetime)
    end

    create index(:invoices, [:org_id])
    create index(:invoices, [:customer_id])
    create index(:invoices, [:status])
    create index(:invoices, [:due_date])
    create unique_index(:invoices, [:invoice_number, :org_id])

    # Double-entry ledger
    create table(:ledger_entries, primary_key: false) do
      add :id, :binary_id, primary_key: true
      add :org_id, :binary_id, null: false
      add :invoice_id, :binary_id
      add :type, :string, null: false
      add :description, :string
      add :amount, :decimal, precision: 15, scale: 2, null: false
      add :direction, :string, null: false
      add :account_code, :string
      add :posted_at, :utc_datetime
      add :metadata, :jsonb, default: "{}"

      timestamps(type: :utc_datetime)
    end

    create index(:ledger_entries, [:org_id])
    create index(:ledger_entries, [:invoice_id])
    create index(:ledger_entries, [:posted_at])
    create index(:ledger_entries, [:type])

    # Payments
    create table(:payments, primary_key: false) do
      add :id, :binary_id, primary_key: true
      add :org_id, :binary_id, null: false
      add :invoice_id, :binary_id
      add :amount, :decimal, precision: 15, scale: 2, null: false
      add :currency, :string, default: "RWF"
      add :method, :string
      add :reference, :string
      add :paid_at, :utc_datetime
      add :recorded_by, :binary_id
      add :metadata, :jsonb, default: "{}"

      timestamps(type: :utc_datetime)
    end

    create index(:payments, [:org_id])
    create index(:payments, [:invoice_id])
  end
end
