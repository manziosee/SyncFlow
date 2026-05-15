defmodule SyncFlow.Fleet.Application do
  use Application

  @impl true
  def start(_type, _args) do
    children = [
      SyncFlow.Fleet.Repo,
      SyncFlow.Fleet.Projectors.VehicleProjector,
      SyncFlow.Fleet.Tracker
    ]

    Supervisor.start_link(children, strategy: :one_for_one, name: SyncFlow.Fleet.Supervisor)
  end
end
