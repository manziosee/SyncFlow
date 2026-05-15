defmodule SyncFlow.Inventory.Repo do
  use Ecto.Repo,
    otp_app: :syncflow_inventory,
    adapter: Ecto.Adapters.Postgres
end
