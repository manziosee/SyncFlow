defmodule SyncFlow.Core.EventStore do
  use EventStore, otp_app: :syncflow_core

  # Convenience wrapper — dispatch a command and broadcast to PubSub
  def append_to_stream(stream_uuid, expected_version, events, opts \\ []) do
    result = super(stream_uuid, expected_version, events, opts)

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
