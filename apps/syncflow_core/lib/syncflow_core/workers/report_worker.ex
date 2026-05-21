defmodule SyncFlow.Core.Workers.ReportWorker do
  @moduledoc """
  Async Oban worker for generating heavy reports.
  Reports run in the background and notify the requesting user when done.

  Supported report types:
    - :monthly_revenue   — revenue totals by month for a given year
    - :inventory_audit   — full inventory value snapshot
    - :payroll_summary   — payroll totals by department
    - :fleet_utilization — trip distance and fuel cost per vehicle
    - :overdue_invoices  — outstanding invoices past due date
  """

  use Oban.Worker, queue: :reports, max_attempts: 2

  @compile {:no_warn_undefined, [
    SyncFlow.Accounting.Queries,
    SyncFlow.Inventory.Queries,
    SyncFlow.HR.Queries,
    SyncFlow.Fleet.Queries
  ]}

  alias SyncFlow.Accounting.Queries, as: AQ
  alias SyncFlow.Inventory.Queries, as: IQ
  alias SyncFlow.HR.Queries, as: HQ
  alias SyncFlow.Fleet.Queries, as: FQ
  alias Phoenix.PubSub

  @impl Oban.Worker
  def perform(%Oban.Job{
        args: %{"type" => type, "org_id" => org_id, "requested_by" => user_id} = args
      }) do
    result = generate_report(String.to_atom(type), org_id, args)

    PubSub.broadcast(
      SyncFlow.PubSub,
      "user:#{user_id}:notifications",
      {:notification,
       %{
         type: "report_ready",
         title: "Report Ready",
         body: "Your #{humanize(type)} report is ready.",
         severity: "success",
         payload: %{report_type: type, data: result}
       }}
    )

    :ok
  end

  # --- Report generators ---

  defp generate_report(:monthly_revenue, org_id, args) do
    year = Map.get(args, "year", Date.utc_today().year)
    data = AQ.revenue_by_month(org_id, year)

    %{
      type: :monthly_revenue,
      year: year,
      rows: Enum.map(data, fn {month, total} -> %{month: month, total: total} end),
      generated_at: DateTime.utc_now()
    }
  end

  defp generate_report(:inventory_audit, org_id, _args) do
    value = IQ.inventory_value(org_id)
    low_stock = IQ.low_stock_items(org_id)

    %{
      type: :inventory_audit,
      total_items: value[:total_items] || 0,
      total_value: value[:total_value] || 0,
      low_stock_count: length(low_stock),
      low_stock_items: Enum.map(low_stock, &%{id: &1.id, name: &1.name, quantity: &1.quantity}),
      generated_at: DateTime.utc_now()
    }
  end

  defp generate_report(:payroll_summary, org_id, _args) do
    headcount = HQ.headcount_by_department(org_id)
    runs = HQ.list_payroll_runs(org_id, status: :approved, per_page: 12)

    %{
      type: :payroll_summary,
      headcount_by_department: headcount,
      recent_runs: Enum.map(runs, &%{period: &1.period_start, net: &1.total_net, status: &1.status}),
      generated_at: DateTime.utc_now()
    }
  end

  defp generate_report(:fleet_utilization, org_id, _args) do
    summary = FQ.fleet_summary(org_id)
    fuel = FQ.fuel_cost_by_vehicle(org_id)

    %{
      type: :fleet_utilization,
      status_breakdown: summary,
      fuel_by_vehicle: fuel,
      generated_at: DateTime.utc_now()
    }
  end

  defp generate_report(:overdue_invoices, org_id, _args) do
    overdue = AQ.overdue_invoices(org_id)
    total = Enum.reduce(overdue, Decimal.new("0"), &Decimal.add(&2, &1.total_amount || Decimal.new("0")))

    %{
      type: :overdue_invoices,
      count: length(overdue),
      total_overdue: total,
      invoices: Enum.map(overdue, &%{id: &1.id, number: &1.invoice_number, amount: &1.total_amount, due: &1.due_date}),
      generated_at: DateTime.utc_now()
    }
  end

  defp generate_report(unknown, _org_id, _args) do
    %{error: "Unknown report type: #{unknown}"}
  end

  # --- Public enqueue helpers ---

  def enqueue(type, org_id, requested_by, extra_args \\ %{}) do
    %{"type" => to_string(type), "org_id" => org_id, "requested_by" => requested_by}
    |> Map.merge(extra_args)
    |> new()
    |> Oban.insert()
  end

  defp humanize(type) do
    type |> String.replace("_", " ") |> String.split() |> Enum.map_join(" ", &String.capitalize/1)
  end
end
