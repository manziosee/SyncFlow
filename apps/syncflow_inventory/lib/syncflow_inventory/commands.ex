defmodule SyncFlow.Inventory.Commands do
  defmodule CreateStockItem do
    @derive Jason.Encoder
    defstruct [
      :item_id, :org_id, :warehouse_id, :sku, :name, :category,
      :unit, :quantity, :reorder_point, :reorder_quantity,
      :unit_cost, :currency, :created_by
    ]
  end

  defmodule AdjustStock do
    @derive Jason.Encoder
    defstruct [:item_id, :warehouse_id, :quantity_delta, :reason, :adjusted_by, :reference_id]
  end

  defmodule TransferStock do
    @derive Jason.Encoder
    defstruct [
      :item_id, :from_warehouse_id, :to_warehouse_id,
      :quantity, :initiated_by, :notes
    ]
  end

  defmodule ReserveStock do
    @derive Jason.Encoder
    defstruct [:item_id, :warehouse_id, :quantity, :reservation_id, :reserved_for]
  end

  defmodule ReleaseReservation do
    @derive Jason.Encoder
    defstruct [:item_id, :reservation_id]
  end
end
