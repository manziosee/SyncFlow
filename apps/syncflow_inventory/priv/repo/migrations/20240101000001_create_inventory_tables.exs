defmodule SyncFlow.Inventory.Repo.Migrations.CreateInventoryTables do
  use Ecto.Migration

  def change do
    create table(:warehouses, primary_key: false) do
      add :id, :binary_id, primary_key: true
      add :org_id, :binary_id, null: false
      add :name, :string, null: false
      add :code, :string, null: false
      add :address, :jsonb
      add :manager_id, :binary_id
      add :is_active, :boolean, default: true
      add :latitude, :float
      add :longitude, :float

      timestamps(type: :utc_datetime)
    end

    create index(:warehouses, [:org_id])
    create unique_index(:warehouses, [:code, :org_id])

    create table(:stock_items, primary_key: false) do
      add :id, :binary_id, primary_key: true
      add :org_id, :binary_id, null: false
      add :warehouse_id, references(:warehouses, type: :binary_id)
      add :sku, :string
      add :name, :string, null: false
      add :category, :string
      add :unit, :string, default: "pcs"
      add :quantity, :decimal, precision: 15, scale: 4, default: 0
      add :reserved_quantity, :decimal, precision: 15, scale: 4, default: 0
      add :reorder_point, :decimal, precision: 15, scale: 4, default: 0
      add :reorder_quantity, :decimal, precision: 15, scale: 4, default: 0
      add :unit_cost, :decimal, precision: 15, scale: 2
      add :currency, :string, default: "RWF"
      add :is_low_stock, :boolean, default: false
      add :is_active, :boolean, default: true
      add :metadata, :jsonb, default: "{}"

      timestamps(type: :utc_datetime)
    end

    create index(:stock_items, [:org_id])
    create index(:stock_items, [:warehouse_id])
    create index(:stock_items, [:sku])
    create index(:stock_items, [:is_low_stock])

    create table(:stock_movements, primary_key: false) do
      add :id, :binary_id, primary_key: true
      add :item_id, references(:stock_items, type: :binary_id), null: false
      add :type, :string, null: false
      add :quantity_delta, :decimal, precision: 15, scale: 4
      add :quantity_after, :decimal, precision: 15, scale: 4
      add :reason, :string
      add :reference_id, :string
      add :performed_by, :binary_id
      add :occurred_at, :utc_datetime

      timestamps(type: :utc_datetime)
    end

    create index(:stock_movements, [:item_id])
    create index(:stock_movements, [:occurred_at])
    create index(:stock_movements, [:type])

    create table(:stock_transfers, primary_key: false) do
      add :id, :binary_id, primary_key: true
      add :item_id, references(:stock_items, type: :binary_id), null: false
      add :from_warehouse_id, :binary_id, null: false
      add :to_warehouse_id, :binary_id, null: false
      add :quantity, :decimal, precision: 15, scale: 4, null: false
      add :status, :string, default: "pending"
      add :initiated_by, :binary_id
      add :initiated_at, :utc_datetime
      add :completed_at, :utc_datetime
      add :notes, :text

      timestamps(type: :utc_datetime)
    end

    create index(:stock_transfers, [:item_id])
    create index(:stock_transfers, [:status])
  end
end
