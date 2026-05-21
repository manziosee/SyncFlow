defmodule SyncFlow.Core.Workers.PayrollWorker do
  @moduledoc """
  Async Oban worker that processes a payroll run:
  calculates Rwanda PAYE for every active employee, inserts pay slips,
  and broadcasts the result so dashboards update live.
  """

  use Oban.Worker, queue: :payroll, max_attempts: 3

  @compile {:no_warn_undefined, SyncFlow.HR.Queries}

  alias SyncFlow.HR.Queries
  alias Phoenix.PubSub

  @impl Oban.Worker
  def perform(%Oban.Job{args: %{"run_id" => run_id, "processed_by" => processed_by}}) do
    case Queries.process_payroll(run_id, processed_by) do
      {:ok, run} ->
        PubSub.broadcast(
          SyncFlow.PubSub,
          "org:#{run.org_id}:hr",
          {:payroll_processed, %{run_id: run.id, total_net: run.total_net, status: run.status}}
        )

        PubSub.broadcast(
          SyncFlow.PubSub,
          "user:#{processed_by}:notifications",
          {:notification,
           %{
             type: "payroll_done",
             title: "Payroll Processed",
             body: "Payroll run for #{run.period_start} – #{run.period_end} is ready for approval.",
             severity: "success",
             payload: %{run_id: run.id}
           }}
        )

        :ok

      {:error, reason} ->
        {:error, inspect(reason)}
    end
  end

  def enqueue(run_id, processed_by) do
    %{"run_id" => run_id, "processed_by" => processed_by}
    |> new()
    |> Oban.insert()
  end
end
