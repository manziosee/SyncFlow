defmodule SyncFlow.Web.Controllers.DashboardController do
  use Phoenix.Controller, formats: [:json]
  use OpenApiSpex.ControllerSpecs

  alias OpenApiSpex.{Parameter, Schema}
  alias SyncFlow.Accounting.Queries, as: AQ
  alias SyncFlow.Inventory.Queries, as: IQ
  alias SyncFlow.HR.Queries, as: HQ
  alias SyncFlow.Fleet.{Queries, Tracker}
  alias SyncFlow.CRM.Queries, as: CQ

  tags ["Dashboard"]
  security [%{"bearerAuth" => []}]

  operation :ceo,
    summary: "CEO dashboard",
    description: "Aggregate KPIs across all domains: invoice stats, overdue totals, fleet status, inventory value, headcount, and monthly revenue chart.",
    parameters: [
      %Parameter{name: :year, in: :query, schema: %Schema{type: :integer, example: 2024, description: "Year for revenue chart"}}
    ],
    responses: %{200 => SyncFlow.Web.ApiSpec.Operations.json_response(200, "CEO dashboard data", "CEODashboard")}

  operation :warehouse,
    summary: "Warehouse dashboard",
    description: "Live warehouse KPIs: stock levels, low-stock count, pending transfers, and inventory value.",
    responses: %{200 => SyncFlow.Web.ApiSpec.Operations.json_response(200, "Warehouse dashboard data", "WarehouseDashboard")}

  operation :regional,
    summary: "Regional analytics dashboard",
    description: "Breakdown of invoices, customers, and stock per warehouse/region.",
    responses: %{200 => SyncFlow.Web.ApiSpec.Operations.json_response(200, "Regional analytics", "RegionalDashboard")}

  # --- Actions ---

  def ceo(conn, params) do
    org_id = conn.assigns.current_org_id
    year = parse_int(params["year"], Date.utc_today().year)

    invoice_stats = AQ.invoice_stats(org_id)
    overdue = AQ.overdue_invoices(org_id)
    overdue_total =
      Enum.reduce(overdue, Decimal.new("0"), fn inv, acc ->
        Decimal.add(acc, inv.total_amount || Decimal.new("0"))
      end)

    inventory = IQ.inventory_value(org_id)
    low_stock_count = length(IQ.low_stock_items(org_id))

    fleet_counts = Queries.fleet_summary(org_id)
    active_vehicles = Tracker.all_active_vehicles()

    headcount = HQ.headcount_by_department(org_id)
    total_headcount = headcount |> Map.values() |> Enum.sum()

    customer_stats = CQ.customer_stats(org_id)

    revenue = AQ.revenue_by_month(org_id, year)

    monthly_revenue =
      Enum.map(revenue, fn {month, total} ->
        %{month: trunc(month), total: total}
      end)

    json(conn, %{
      data: %{
        year: year,
        invoices: %{
          stats: invoice_stats,
          overdue_count: length(overdue),
          overdue_total: overdue_total
        },
        inventory: %{
          total_items: inventory[:total_items] || 0,
          total_value: inventory[:total_value] || Decimal.new("0"),
          low_stock_count: low_stock_count
        },
        fleet: %{
          by_status: fleet_counts,
          total: fleet_counts |> Map.values() |> Enum.sum(),
          active_on_gps: length(active_vehicles)
        },
        hr: %{
          headcount_by_department: headcount,
          total_active: total_headcount
        },
        customers: customer_stats,
        revenue_by_month: monthly_revenue
      }
    })
  end

  def warehouse(conn, _params) do
    org_id = conn.assigns.current_org_id

    warehouses = IQ.list_warehouses(org_id)
    inventory = IQ.inventory_value(org_id)
    low_stock = IQ.low_stock_items(org_id)
    pending_transfers = IQ.list_transfers(status: "in_transit") |> length()

    warehouse_data =
      Enum.map(warehouses, fn wh ->
        items = IQ.list_stock_items(org_id, warehouse_id: wh.id, per_page: 1000)
        low = Enum.filter(items, & &1.is_low_stock)

        %{
          id: wh.id,
          name: wh.name,
          code: wh.code,
          total_items: length(items),
          low_stock_count: length(low),
          is_active: wh.is_active
        }
      end)

    json(conn, %{
      data: %{
        warehouses: warehouse_data,
        totals: %{
          total_warehouses: length(warehouses),
          total_items: inventory[:total_items] || 0,
          total_value: inventory[:total_value] || Decimal.new("0"),
          low_stock_count: length(low_stock),
          pending_transfers: pending_transfers,
          currency: "RWF"
        },
        low_stock_items: Enum.take(low_stock, 10)
      }
    })
  end

  def regional(conn, _params) do
    org_id = conn.assigns.current_org_id

    warehouses = IQ.list_warehouses(org_id)

    regions =
      Enum.map(warehouses, fn wh ->
        items = IQ.list_stock_items(org_id, warehouse_id: wh.id, per_page: 1000)
        low = Enum.filter(items, & &1.is_low_stock)

        value =
          Enum.reduce(items, Decimal.new("0"), fn item, acc ->
            cost = item.unit_cost || Decimal.new("0")
            qty = item.quantity || Decimal.new("0")
            Decimal.add(acc, Decimal.mult(qty, cost))
          end)

        %{
          warehouse_id: wh.id,
          warehouse_name: wh.name,
          code: wh.code,
          latitude: wh.latitude,
          longitude: wh.longitude,
          stock: %{
            total_items: length(items),
            low_stock_count: length(low),
            total_value: value
          }
        }
      end)

    json(conn, %{
      data: %{
        regions: regions,
        total_regions: length(regions),
        snapshot_at: DateTime.utc_now()
      }
    })
  end

  defp parse_int(nil, default), do: default
  defp parse_int(v, _), do: String.to_integer(v)
end
