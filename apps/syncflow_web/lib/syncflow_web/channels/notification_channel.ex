defmodule SyncFlow.Web.Channels.NotificationChannel do
  @moduledoc "Personal notification stream per user."

  use Phoenix.Channel

  def join("notifications:" <> user_id, _params, socket) do
    if socket.assigns.user_id == user_id do
      Phoenix.PubSub.subscribe(SyncFlow.PubSub, "user:#{user_id}:notifications")
      Phoenix.PubSub.subscribe(SyncFlow.PubSub, "org:#{socket.assigns.org_id}:alerts")
      {:ok, %{}, socket}
    else
      {:error, %{reason: "unauthorized"}}
    end
  end

  def handle_in("mark_read", %{"notification_id" => _id}, socket) do
    {:reply, :ok, socket}
  end

  def handle_info({:notification, payload}, socket) do
    push(socket, "notification", payload)
    {:noreply, socket}
  end

  def handle_info({:low_stock, evt}, socket) do
    push(socket, "notification", %{
      type: "low_stock",
      title: "Low Stock Alert",
      body: "Item #{evt.item_id} is below reorder point",
      severity: "warning",
      payload: evt
    })

    {:noreply, socket}
  end

  def handle_info(_, socket), do: {:noreply, socket}
end
