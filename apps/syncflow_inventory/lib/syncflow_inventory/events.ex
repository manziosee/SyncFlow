defmodule SyncFlow.Inventory.Events do
  defmodule StockItemCreated do
    @derive Jason.Encoder
    defstruct [:item_id, :org_id, :warehouse_id, :sku, :name, :category,
               :unit, :quantity, :reorder_point, :reorder_quantity,
               :unit_cost, :currency, :created_by, :created_at]
  end

  defmodule StockAdjusted do
    @derive Jason.Encoder
    defstruct [:item_id, :warehouse_id, :quantity_before, :quantity_after,
               :quantity_delta, :reason, :adjusted_by, :reference_id, :adjusted_at]
  end

  defmodule StockTransferInitiated do
    @derive Jason.Encoder
    defstruct [:item_id, :transfer_id, :from_warehouse_id, :to_warehouse_id,
               :quantity, :initiated_by, :initiated_at, :notes]
  end

  defmodule StockTransferCompleted do
    @derive Jason.Encoder
    defstruct [:item_id, :transfer_id, :completed_at]
  end

  defmodule StockReserved do
    @derive Jason.Encoder
    defstruct [:item_id, :warehouse_id, :reservation_id, :quantity, :reserved_for, :reserved_at]
  end

  defmodule StockReservationReleased do
    @derive Jason.Encoder
    defstruct [:item_id, :reservation_id, :released_at]
  end

  defmodule LowStockAlert do
    @derive Jason.Encoder
    defstruct [:item_id, :org_id, :warehouse_id, :current_quantity, :reorder_point, :triggered_at]
  end
end
