defmodule SyncFlow.CRM.Application do
  use Application

  @impl true
  def start(_type, _args) do
    children = [SyncFlow.CRM.Repo, SyncFlow.CRM.Projectors.CustomerProjector]
    Supervisor.start_link(children, strategy: :one_for_one, name: SyncFlow.CRM.Supervisor)
  end
end
