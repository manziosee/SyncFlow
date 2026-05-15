defmodule SyncFlow.Accounting.Repo do
  use Ecto.Repo,
    otp_app: :syncflow_accounting,
    adapter: Ecto.Adapters.Postgres
end
