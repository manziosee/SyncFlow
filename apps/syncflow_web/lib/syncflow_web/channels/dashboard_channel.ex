defmodule SyncFlow.Web.Channels.DashboardChannel do
  @moduledoc """
  Live analytics dashboard channel. Clients subscribe to their role-based dashboard
  and receive pushed updates whenever underlying data changes.
  """

  use Phoenix.Channel
  alias SyncFlow.Accounting.Queries, as: AQ
  alias SyncFlow.Inventory.Queries, as: IQ

  def join("dashboard:" <> dashboard_type, _params, socket) do
    org_id = socket.assigns.org_id
    send(self(), {:load_initial, dashboard_type})

    # Subscribe to all org-level events
    Phoenix.PubSub.subscribe(SyncFlow.PubSub, "org:#{org_id}:invoices")
    Phoenix.PubSub.subscribe(SyncFlow.PubSub, "org:#{org_id}:alerts")
    Phoenix.PubSub.subscribe(SyncFlow.PubSub, "fleet:live")

    {:ok, %{dashboard: dashboard_type}, assign(socket, :dashboard_type, dashboard_type)}
  end

  def handle_info({:load_initial, "ceo"}, socket) do
    push(socket, "dashboard_data", ceo_dashboard(socket.assigns.org_id))
    {:noreply, socket}
  end

  def handle_info({:load_initial, "warehouse"}, socket) do
    push(socket, "dashboard_data", warehouse_dashboard(socket.assigns.org_id))
    {:noreply, socket}
  end

  def handle_info({:load_initial, _}, socket) do
    push(socket, "dashboard_data", %{status: "loaded"})
    {:noreply, socket}
  end

  # Reactive: push updated KPIs when an invoice is created
  def handle_info({:invoice_created, _evt}, socket) do
    push(socket, "kpi_update", %{type: "invoice_count", delta: 1})
    {:noreply, socket}
  end

  # Push low stock alerts
  def handle_info({:low_stock, evt}, socket) do
    push(socket, "alert", %{
      type: "low_stock",
      item_id: evt.item_id,
      warehouse_id: evt.warehouse_id,
      quantity: evt.current_quantity,
      reorder_point: evt.reorder_point,
      severity: "warning"
    })

    {:noreply, socket}
  end

  # Push live fleet updates to CEO/fleet dashboard
  def handle_info({:location_updated, entry}, socket) do
    push(socket, "vehicle_location", entry)
    {:noreply, socket}
  end

  def handle_info(_, socket), do: {:noreply, socket}

  # Client can request a data refresh
  def handle_in("refresh", %{"type" => type}, socket) do
    data =
      case type do
        "invoices" -> %{stats: AQ.invoice_stats(socket.assigns.org_id)}
        _ -> %{}
      end

    {:reply, {:ok, data}, socket}
  end

  defp ceo_dashboard(org_id) do
    stats = AQ.invoice_stats(org_id)
    overdue = AQ.overdue_invoices(org_id)

    %{
      invoices: stats,
      overdue_count: length(overdue),
      overdue_total: Enum.reduce(overdue, Decimal.new("0"), &Decimal.add(&2, &1.total_amount || Decimal.new("0")))
    }
  end

  defp warehouse_dashboard(org_id) do
    %{
      low_stock_count: 0,
      pending_transfers: 0
    }
  end
end
