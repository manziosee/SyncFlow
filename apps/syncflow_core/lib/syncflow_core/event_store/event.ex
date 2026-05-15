defmodule SyncFlow.Core.Event do
  @moduledoc """
  Base behaviour for all domain events. Every event must declare its stream prefix,
  data fields, and an optional version for schema evolution.
  """

  defmacro __using__(opts) do
    stream_prefix = Keyword.fetch!(opts, :stream)

    quote do
      @stream_prefix unquote(stream_prefix)
      @derive Jason.Encoder

      defstruct Keyword.get(unquote(opts), :fields, []) ++
                  [:event_id, :aggregate_id, :occurred_at, :causation_id, :correlation_id]

      def stream_prefix, do: @stream_prefix

      def new(attrs \\ %{}) do
        struct(__MODULE__, Map.merge(%{event_id: UUID.uuid4(), occurred_at: DateTime.utc_now()}, attrs))
      end
    end
  end
end
