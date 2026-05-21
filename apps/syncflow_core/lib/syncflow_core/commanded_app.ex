defmodule SyncFlow.Core.CommandedApp do
  use Commanded.Application,
    otp_app: :syncflow_core,
    event_store: [
      adapter: Commanded.EventStore.Adapters.EventStore,
      event_store: SyncFlow.Core.EventStore
    ]

  # Router registered at startup by SyncFlow.Web.Application after all apps compile.
end
