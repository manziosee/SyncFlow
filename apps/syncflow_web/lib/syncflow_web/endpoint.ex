defmodule SyncFlow.Web.Endpoint do
  use Phoenix.Endpoint, otp_app: :syncflow_web

  socket "/socket", SyncFlow.Web.UserSocket,
    websocket: [
      timeout: 45_000,
      compress: true,
      max_frame_size: 1_048_576
    ],
    longpoll: false

  plug Corsica,
    origins: [
      "http://localhost:3000",
      "http://localhost:5173",
      ~r{^https://.+\.syncflow\.rw$}
    ],
    allow_headers: ["authorization", "content-type", "x-request-id"],
    allow_methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"]

  plug Plug.RequestId
  plug Plug.Telemetry, event_prefix: [:phoenix, :endpoint]

  plug Plug.Parsers,
    parsers: [:urlencoded, :multipart, :json],
    pass: ["*/*"],
    json_decoder: Phoenix.json_library()

  plug Plug.MethodOverride
  plug Plug.Head
  plug SyncFlow.Web.Router
end
