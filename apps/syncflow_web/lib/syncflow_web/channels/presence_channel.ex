defmodule SyncFlow.Web.Channels.PresenceChannel do
  @moduledoc """
  General presence channel. Clients join `presence:<scope>` to see who is
  online within a given scope (org-wide, a module, or a specific resource).

  Examples:
    presence:org                 — everyone online in the org
    presence:invoices            — users browsing the invoices module
    presence:invoice:<id>        — handled by InvoiceChannel directly
  """

  use Phoenix.Channel
  alias SyncFlow.Web.Presence

  def join("presence:" <> scope, _params, socket) do
    socket = assign(socket, :scope, scope)
    send(self(), :after_join)
    {:ok, %{scope: scope}, socket}
  end

  def handle_info(:after_join, socket) do
    {:ok, _} =
      Presence.track(socket, socket.assigns.user_id, %{
        name: socket.assigns.user_name,
        role: socket.assigns.role,
        scope: socket.assigns.scope,
        online_at: DateTime.utc_now() |> DateTime.to_iso8601()
      })

    push(socket, "presence_state", Presence.list(socket))
    {:noreply, socket}
  end

  def handle_info({:DOWN, _, _, _, _}, socket), do: {:noreply, socket}
  def handle_info(_, socket), do: {:noreply, socket}

  def handle_in("ping", _payload, socket) do
    {:reply, {:ok, %{status: "pong"}}, socket}
  end
end
