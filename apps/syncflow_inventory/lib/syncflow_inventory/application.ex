defmodule SyncFlow.Inventory.Application do
  use Application

  @impl true
  def start(_type, _args) do
    children = [
      SyncFlow.Inventory.Repo,
      SyncFlow.Inventory.Projectors.StockProjector
    ]

    Supervisor.start_link(children, strategy: :one_for_one, name: SyncFlow.Inventory.Supervisor)
  end
end
