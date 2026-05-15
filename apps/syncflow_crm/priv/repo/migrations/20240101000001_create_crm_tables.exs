defmodule SyncFlow.CRM.Repo.Migrations.CreateCRMTables do
  use Ecto.Migration

  def change do
    create table(:customers, primary_key: false) do
      add :id, :binary_id, primary_key: true
      add :org_id, :binary_id, null: false
      add :name, :string, null: false
      add :email, :string
      add :phone, :string
      add :type, :string, default: "individual"
      add :status, :string, default: "active"
      add :address, :jsonb
      add :credit_limit, :decimal, precision: 15, scale: 2
      add :outstanding_balance, :decimal, precision: 15, scale: 2, default: 0
      add :tags, {:array, :string}, default: []
      add :metadata, :jsonb, default: "{}"

      timestamps(type: :utc_datetime)
    end

    create index(:customers, [:org_id])
    create index(:customers, [:status])
    create index(:customers, [:email])

    create table(:interactions, primary_key: false) do
      add :id, :binary_id, primary_key: true
      add :customer_id, references(:customers, type: :binary_id), null: false
      add :type, :string, null: false
      add :notes, :text
      add :outcome, :string
      add :recorded_by, :binary_id
      add :occurred_at, :utc_datetime

      timestamps(type: :utc_datetime)
    end

    create index(:interactions, [:customer_id])
    create index(:interactions, [:occurred_at])
  end
end
