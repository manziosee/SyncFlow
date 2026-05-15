defmodule SyncFlow.Inventory.Aggregates.StockItem do
  alias SyncFlow.Inventory.Commands
  alias SyncFlow.Inventory.Events

  defstruct [
    :item_id, :org_id, :warehouse_id, :sku, :name,
    :quantity, :reserved_quantity, :reorder_point, :reorder_quantity,
    reservations: %{}
  ]

  def execute(%__MODULE__{item_id: nil}, %Commands.CreateStockItem{} = cmd) do
    %Events.StockItemCreated{
      item_id: cmd.item_id,
      org_id: cmd.org_id,
      warehouse_id: cmd.warehouse_id,
      sku: cmd.sku,
      name: cmd.name,
      category: cmd.category,
      unit: cmd.unit,
      quantity: cmd.quantity || 0,
      reorder_point: cmd.reorder_point || 0,
      reorder_quantity: cmd.reorder_quantity || 0,
      unit_cost: cmd.unit_cost,
      currency: cmd.currency || "RWF",
      created_by: cmd.created_by,
      created_at: DateTime.utc_now()
    }
  end

  def execute(%__MODULE__{} = item, %Commands.AdjustStock{} = cmd) do
    new_qty = item.quantity + cmd.quantity_delta

    if new_qty < 0 do
      {:error, :insufficient_stock}
    else
      events = [
        %Events.StockAdjusted{
          item_id: item.item_id,
          warehouse_id: cmd.warehouse_id,
          quantity_before: item.quantity,
          quantity_after: new_qty,
          quantity_delta: cmd.quantity_delta,
          reason: cmd.reason,
          adjusted_by: cmd.adjusted_by,
          reference_id: cmd.reference_id,
          adjusted_at: DateTime.utc_now()
        }
      ]

      if new_qty <= item.reorder_point do
        events ++
          [
            %Events.LowStockAlert{
              item_id: item.item_id,
              org_id: item.org_id,
              warehouse_id: item.warehouse_id,
              current_quantity: new_qty,
              reorder_point: item.reorder_point,
              triggered_at: DateTime.utc_now()
            }
          ]
      else
        events
      end
    end
  end

  def execute(%__MODULE__{} = item, %Commands.TransferStock{} = cmd) do
    available = item.quantity - (item.reserved_quantity || 0)

    if cmd.quantity > available do
      {:error, :insufficient_available_stock}
    else
      %Events.StockTransferInitiated{
        item_id: item.item_id,
        transfer_id: UUID.uuid4(),
        from_warehouse_id: cmd.from_warehouse_id,
        to_warehouse_id: cmd.to_warehouse_id,
        quantity: cmd.quantity,
        initiated_by: cmd.initiated_by,
        initiated_at: DateTime.utc_now(),
        notes: cmd.notes
      }
    end
  end

  def execute(%__MODULE__{} = item, %Commands.ReserveStock{} = cmd) do
    available = item.quantity - (item.reserved_quantity || 0)

    if cmd.quantity > available do
      {:error, :insufficient_stock_for_reservation}
    else
      %Events.StockReserved{
        item_id: item.item_id,
        warehouse_id: cmd.warehouse_id,
        reservation_id: cmd.reservation_id,
        quantity: cmd.quantity,
        reserved_for: cmd.reserved_for,
        reserved_at: DateTime.utc_now()
      }
    end
  end

  def execute(%__MODULE__{} = item, %Commands.ReleaseReservation{} = cmd) do
    if Map.has_key?(item.reservations, cmd.reservation_id) do
      %Events.StockReservationReleased{
        item_id: item.item_id,
        reservation_id: cmd.reservation_id,
        released_at: DateTime.utc_now()
      }
    else
      {:error, :reservation_not_found}
    end
  end

  # State evolution
  def apply(%__MODULE__{} = s, %Events.StockItemCreated{} = evt) do
    %{s |
      item_id: evt.item_id,
      org_id: evt.org_id,
      warehouse_id: evt.warehouse_id,
      sku: evt.sku,
      name: evt.name,
      quantity: evt.quantity,
      reserved_quantity: 0,
      reorder_point: evt.reorder_point,
      reorder_quantity: evt.reorder_quantity,
      reservations: %{}
    }
  end

  def apply(%__MODULE__{} = s, %Events.StockAdjusted{quantity_after: qty}) do
    %{s | quantity: qty}
  end

  def apply(%__MODULE__{} = s, %Events.StockReserved{} = evt) do
    reservations = Map.put(s.reservations, evt.reservation_id, evt.quantity)
    reserved = Enum.sum(Map.values(reservations))
    %{s | reservations: reservations, reserved_quantity: reserved}
  end

  def apply(%__MODULE__{} = s, %Events.StockReservationReleased{} = evt) do
    reservations = Map.delete(s.reservations, evt.reservation_id)
    reserved = Enum.sum(Map.values(reservations))
    %{s | reservations: reservations, reserved_quantity: reserved}
  end

  def apply(s, _evt), do: s
end
