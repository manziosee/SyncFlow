defmodule SyncFlow.Inventory.Projectors.StockProjector do
  use Commanded.Projections.Ecto,
    application: SyncFlow.Core.CommandedApp,
    repo: SyncFlow.Inventory.Repo,
    name: "stock_projector",
    consistency: :strong

  import Ecto.Query
  alias SyncFlow.Inventory.Events
  alias SyncFlow.Inventory.Schema.{StockItem, StockMovement, Warehouse}

  project(%Events.StockItemCreated{} = evt, _meta, fn multi ->
    item = %StockItem{
      id: evt.item_id,
      org_id: evt.org_id,
      warehouse_id: evt.warehouse_id,
      sku: evt.sku,
      name: evt.name,
      category: evt.category,
      unit: evt.unit,
      quantity: Decimal.new(to_string(evt.quantity)),
      reserved_quantity: Decimal.new("0"),
      reorder_point: Decimal.new(to_string(evt.reorder_point)),
      reorder_quantity: Decimal.new(to_string(evt.reorder_quantity)),
      unit_cost: evt.unit_cost && Decimal.new(to_string(evt.unit_cost)),
      currency: evt.currency
    }

    Ecto.Multi.insert(multi, :stock_item, item)
  end)

  project(%Events.StockAdjusted{} = evt, _meta, fn multi ->
    multi
    |> Ecto.Multi.update_all(:update_stock,
      from(s in StockItem, where: s.id == ^evt.item_id),
      set: [quantity: evt.quantity_after]
    )
    |> Ecto.Multi.insert(:movement, %StockMovement{
      id: UUID.uuid4(),
      item_id: evt.item_id,
      type: :adjustment,
      quantity_delta: evt.quantity_delta,
      quantity_after: evt.quantity_after,
      reason: evt.reason,
      reference_id: evt.reference_id,
      performed_by: evt.adjusted_by,
      occurred_at: evt.adjusted_at
    })
  end)

  project(%Events.StockTransferInitiated{} = evt, _meta, fn multi ->
    Ecto.Multi.insert(multi, :transfer, %SyncFlow.Inventory.Schema.StockTransfer{
      id: evt.transfer_id,
      item_id: evt.item_id,
      from_warehouse_id: evt.from_warehouse_id,
      to_warehouse_id: evt.to_warehouse_id,
      quantity: evt.quantity,
      status: :in_transit,
      initiated_by: evt.initiated_by,
      initiated_at: evt.initiated_at,
      notes: evt.notes
    })
  end)

  project(%Events.LowStockAlert{} = evt, _meta, fn multi ->
    Ecto.Multi.update_all(multi, :flag_low_stock,
      from(s in StockItem, where: s.id == ^evt.item_id),
      set: [is_low_stock: true]
    )
  end)

  @impl true
  def after_update(event, _metadata, _changes) do
    broadcast_stock_event(event)
    :ok
  end

  defp broadcast_stock_event(%Events.StockAdjusted{} = evt) do
    Phoenix.PubSub.broadcast(SyncFlow.PubSub, "warehouse:#{evt.warehouse_id}", {:stock_adjusted, evt})
  end

  defp broadcast_stock_event(%Events.LowStockAlert{} = evt) do
    Phoenix.PubSub.broadcast(SyncFlow.PubSub, "org:#{evt.org_id}:alerts", {:low_stock, evt})
    Phoenix.PubSub.broadcast(SyncFlow.PubSub, "warehouse:#{evt.warehouse_id}", {:low_stock_alert, evt})
  end

  defp broadcast_stock_event(%Events.StockTransferInitiated{} = evt) do
    Phoenix.PubSub.broadcast(SyncFlow.PubSub, "inventory:transfers", {:transfer_started, evt})
  end

  defp broadcast_stock_event(_), do: :ok
end
