defmodule SyncFlow.Web.UserSocket do
  use Phoenix.Socket

  channel "invoice:*", SyncFlow.Web.Channels.InvoiceChannel
  channel "dashboard:*", SyncFlow.Web.Channels.DashboardChannel
  channel "inventory:*", SyncFlow.Web.Channels.InventoryChannel
  channel "fleet:*", SyncFlow.Web.Channels.FleetChannel
  channel "notifications:*", SyncFlow.Web.Channels.NotificationChannel
  channel "presence:*", SyncFlow.Web.Channels.PresenceChannel

  @impl true
  def connect(%{"token" => token}, socket, _connect_info) do
    case SyncFlow.Core.Auth.Guardian.decode_and_verify(token) do
      {:ok, claims} ->
        case SyncFlow.Core.Auth.Guardian.resource_from_claims(claims) do
          {:ok, user} ->
            socket =
              socket
              |> assign(:user_id, user.id)
              |> assign(:user_name, user.name)
              |> assign(:org_id, user.org_id)
              |> assign(:role, user.role)

            SyncFlow.Core.Accounts.touch_last_seen(user)
            {:ok, socket}

          _ ->
            :error
        end

      _ ->
        :error
    end
  end

  def connect(_, _, _), do: :error

  @impl true
  def id(socket), do: "user_socket:#{socket.assigns.user_id}"
end
