defmodule SyncFlow.Core.Application do
  use Application

  @impl true
  def start(_type, _args) do
    children = [
      SyncFlow.Core.Repo,
      {Oban, Application.fetch_env!(:syncflow_core, Oban)},
      {Finch, name: SyncFlow.Finch},
      SyncFlow.Core.CommandedApp
    ]

    opts = [strategy: :one_for_one, name: SyncFlow.Core.Supervisor]
    Supervisor.start_link(children, opts)
  end
end
