defmodule SyncFlow.Web.Channels.InventoryChannel do
  use Phoenix.Channel
  alias SyncFlow.Core.CommandedApp
  alias SyncFlow.Inventory.Commands

  def join("inventory:warehouse:" <> warehouse_id, _params, socket) do
    Phoenix.PubSub.subscribe(SyncFlow.PubSub, "warehouse:#{warehouse_id}")
    {:ok, %{warehouse_id: warehouse_id}, assign(socket, :warehouse_id, warehouse_id)}
  end

  def join("inventory:transfers", _params, socket) do
    Phoenix.PubSub.subscribe(SyncFlow.PubSub, "inventory:transfers")
    {:ok, %{}, socket}
  end

  def handle_in("adjust_stock", params, socket) do
    cmd = %Commands.AdjustStock{
      item_id: params["item_id"],
      warehouse_id: socket.assigns[:warehouse_id] || params["warehouse_id"],
      quantity_delta: params["quantity_delta"],
      reason: params["reason"],
      adjusted_by: socket.assigns.user_id,
      reference_id: params["reference_id"]
    }

    case CommandedApp.dispatch(cmd) do
      :ok -> {:reply, :ok, socket}
      {:error, reason} -> {:reply, {:error, %{reason: to_string(reason)}}, socket}
    end
  end

  def handle_in("transfer_stock", params, socket) do
    cmd = %Commands.TransferStock{
      item_id: params["item_id"],
      from_warehouse_id: params["from_warehouse_id"],
      to_warehouse_id: params["to_warehouse_id"],
      quantity: params["quantity"],
      initiated_by: socket.assigns.user_id,
      notes: params["notes"]
    }

    case CommandedApp.dispatch(cmd) do
      :ok -> {:reply, :ok, socket}
      {:error, reason} -> {:reply, {:error, %{reason: to_string(reason)}}, socket}
    end
  end

  def handle_info({:stock_adjusted, evt}, socket) do
    push(socket, "stock_updated", %{
      item_id: evt.item_id,
      quantity_after: evt.quantity_after,
      quantity_delta: evt.quantity_delta
    })

    {:noreply, socket}
  end

  def handle_info({:low_stock_alert, evt}, socket) do
    push(socket, "low_stock_alert", %{
      item_id: evt.item_id,
      current_quantity: evt.current_quantity,
      reorder_point: evt.reorder_point
    })

    {:noreply, socket}
  end

  def handle_info({:transfer_started, evt}, socket) do
    push(socket, "transfer_started", %{
      item_id: evt.item_id,
      transfer_id: evt.transfer_id,
      from_warehouse_id: evt.from_warehouse_id,
      to_warehouse_id: evt.to_warehouse_id,
      quantity: evt.quantity
    })

    {:noreply, socket}
  end

  def handle_info(_, socket), do: {:noreply, socket}
end
