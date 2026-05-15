defmodule SyncFlow.Web.Controllers.DashboardController do
  use Phoenix.Controller, formats: [:json]

  alias SyncFlow.Accounting.Queries, as: AQ

  def ceo(conn, params) do
    org_id = conn.assigns.current_org_id
    year = String.to_integer(params["year"] || to_string(Date.utc_today().year))

    data = %{
      invoice_stats: AQ.invoice_stats(org_id),
      overdue_count: length(AQ.overdue_invoices(org_id)),
      revenue_by_month: AQ.revenue_by_month(org_id, year),
      fleet_vehicles: SyncFlow.Fleet.Tracker.all_active_vehicles()
    }

    json(conn, %{data: data})
  end

  def warehouse(conn, _params) do
    json(conn, %{data: %{status: "ok"}})
  end
end
