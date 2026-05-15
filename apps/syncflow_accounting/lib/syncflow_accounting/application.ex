defmodule SyncFlow.Accounting.Application do
  use Application

  @impl true
  def start(_type, _args) do
    children = [
      SyncFlow.Accounting.Repo,
      SyncFlow.Accounting.Projectors.InvoiceProjector,
      SyncFlow.Accounting.Projectors.LedgerProjector
    ]

    Supervisor.start_link(children, strategy: :one_for_one, name: SyncFlow.Accounting.Supervisor)
  end
end
