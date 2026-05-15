defmodule SyncFlow.Web.Controllers.HealthController do
  use Phoenix.Controller, formats: [:json]

  def check(conn, _params) do
    json(conn, %{
      status: "ok",
      version: "0.1.0",
      timestamp: DateTime.utc_now()
    })
  end
end
