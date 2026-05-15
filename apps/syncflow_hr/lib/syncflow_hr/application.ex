defmodule SyncFlow.HR.Application do
  use Application

  @impl true
  def start(_type, _args) do
    children = [SyncFlow.HR.Repo]
    Supervisor.start_link(children, strategy: :one_for_one, name: SyncFlow.HR.Supervisor)
  end
end
