defmodule SyncFlow.Inventory.Schema.StockItem do
  use Ecto.Schema
  @derive {Jason.Encoder, except: [:__meta__]}

  @primary_key {:id, :binary_id, autogenerate: false}

  schema "stock_items" do
    field :org_id, :binary_id
    field :warehouse_id, :binary_id
    field :sku, :string
    field :name, :string
    field :category, :string
    field :unit, :string, default: "pcs"
    field :quantity, :decimal, default: Decimal.new("0")
    field :reserved_quantity, :decimal, default: Decimal.new("0")
    field :reorder_point, :decimal, default: Decimal.new("0")
    field :reorder_quantity, :decimal, default: Decimal.new("0")
    field :unit_cost, :decimal
    field :currency, :string, default: "RWF"
    field :is_low_stock, :boolean, default: false
    field :is_active, :boolean, default: true
    field :metadata, :map, default: %{}

    timestamps(type: :utc_datetime)
  end
end

defmodule SyncFlow.Inventory.Schema.StockMovement do
  use Ecto.Schema
  @derive {Jason.Encoder, except: [:__meta__]}

  @primary_key {:id, :binary_id, autogenerate: false}

  schema "stock_movements" do
    field :item_id, :binary_id
    field :type, Ecto.Enum, values: [:adjustment, :transfer_out, :transfer_in, :reservation, :sale, :purchase]
    field :quantity_delta, :decimal
    field :quantity_after, :decimal
    field :reason, :string
    field :reference_id, :string
    field :performed_by, :binary_id
    field :occurred_at, :utc_datetime

    timestamps(type: :utc_datetime)
  end
end

defmodule SyncFlow.Inventory.Schema.StockTransfer do
  use Ecto.Schema
  @derive {Jason.Encoder, except: [:__meta__]}

  @primary_key {:id, :binary_id, autogenerate: false}

  schema "stock_transfers" do
    field :item_id, :binary_id
    field :from_warehouse_id, :binary_id
    field :to_warehouse_id, :binary_id
    field :quantity, :decimal
    field :status, Ecto.Enum, values: [:pending, :in_transit, :completed, :cancelled], default: :pending
    field :initiated_by, :binary_id
    field :initiated_at, :utc_datetime
    field :completed_at, :utc_datetime
    field :notes, :string

    timestamps(type: :utc_datetime)
  end
end

defmodule SyncFlow.Inventory.Schema.Warehouse do
  use Ecto.Schema
  @derive {Jason.Encoder, except: [:__meta__]}
  import Ecto.Changeset

  @primary_key {:id, :binary_id, autogenerate: true}

  schema "warehouses" do
    field :org_id, :binary_id
    field :name, :string
    field :code, :string
    field :address, :map
    field :manager_id, :binary_id
    field :is_active, :boolean, default: true
    field :latitude, :float
    field :longitude, :float

    timestamps(type: :utc_datetime)
  end

  def changeset(w, attrs) do
    w
    |> cast(attrs, [:org_id, :name, :code, :address, :manager_id, :latitude, :longitude])
    |> validate_required([:org_id, :name, :code])
    |> unique_constraint(:code, name: :warehouses_code_org_id_index)
  end
end
