defmodule SyncFlow.Core.EventStore do
  use EventStore, otp_app: :syncflow_core

  # Append events and broadcast to PubSub for real-time subscribers
  def append_and_broadcast(stream_uuid, expected_version, events, opts \\ []) do
    result = append_to_stream(stream_uuid, expected_version, events, opts)

    if result == :ok do
      Enum.each(events, fn event ->
        Phoenix.PubSub.broadcast(
          SyncFlow.PubSub,
          "events:#{stream_uuid}",
          {:event, event}
        )
      end)
    end

    result
  end
end
