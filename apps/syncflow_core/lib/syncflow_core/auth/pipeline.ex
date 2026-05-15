defmodule SyncFlow.Core.Auth.Pipeline do
  use Guardian.Plug.Pipeline,
    otp_app: :syncflow_core,
    module: SyncFlow.Core.Auth.Guardian,
    error_handler: SyncFlow.Web.Auth.ErrorHandler

  plug Guardian.Plug.VerifyHeader, scheme: "Bearer"
  plug Guardian.Plug.EnsureAuthenticated
  plug Guardian.Plug.LoadResource, allow_blank: false
end

defmodule SyncFlow.Core.Auth.OptionalPipeline do
  use Guardian.Plug.Pipeline,
    otp_app: :syncflow_core,
    module: SyncFlow.Core.Auth.Guardian,
    error_handler: SyncFlow.Web.Auth.ErrorHandler

  plug Guardian.Plug.VerifyHeader, scheme: "Bearer"
  plug Guardian.Plug.LoadResource, allow_blank: true
end
