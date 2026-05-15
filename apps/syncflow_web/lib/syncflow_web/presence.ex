defmodule SyncFlow.Web.Presence do
  @moduledoc """
  Tracks which users are online in which resource (invoice, dashboard, etc.).
  Used to show collaborative cursors and live avatars.
  """
  use Phoenix.Presence,
    otp_app: :syncflow_web,
    pubsub_server: SyncFlow.PubSub

  def track_user(socket, user_id, meta) do
    track(socket, user_id, meta)
  end

  def list_users(topic) do
    list(topic)
    |> Enum.map(fn {user_id, %{metas: [meta | _]}} ->
      Map.put(meta, :user_id, user_id)
    end)
  end

  def user_count(topic) do
    topic |> list() |> map_size()
  end
end
