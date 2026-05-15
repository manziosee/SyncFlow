defmodule SyncFlow.Fleet.Repo do
  use Ecto.Repo, otp_app: :syncflow_fleet, adapter: Ecto.Adapters.Postgres
end
