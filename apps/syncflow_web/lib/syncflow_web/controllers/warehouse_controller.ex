defmodule SyncFlow.Web.Controllers.WarehouseController do
  use Phoenix.Controller, formats: [:json]
  use OpenApiSpex.ControllerSpecs

  alias SyncFlow.Inventory.Queries

  tags ["Warehouses"]
  security [%{"bearerAuth" => []}]

  operation :index,
    summary: "List warehouses",
    responses: %{200 => SyncFlow.Web.ApiSpec.Operations.json_response(200, "Warehouse list", "PaginatedResponse")}

  operation :show,
    summary: "Get warehouse",
    parameters: [SyncFlow.Web.ApiSpec.Operations.id_path_param("Warehouse UUID")],
    responses: %{
      200 => SyncFlow.Web.ApiSpec.Operations.json_response(200, "Warehouse details", "Warehouse"),
      404 => SyncFlow.Web.ApiSpec.Operations.json_response(404, "Not found", "ErrorResponse")
    }

  operation :create,
    summary: "Create warehouse",
    request_body: SyncFlow.Web.ApiSpec.Operations.json_request_body("Warehouse data", "CreateWarehouseRequest"),
    responses: %{
      201 => SyncFlow.Web.ApiSpec.Operations.json_response(201, "Warehouse created", "Warehouse"),
      422 => SyncFlow.Web.ApiSpec.Operations.json_response(422, "Validation error", "ErrorResponse")
    }

  operation :update,
    summary: "Update warehouse",
    parameters: [SyncFlow.Web.ApiSpec.Operations.id_path_param()],
    request_body: SyncFlow.Web.ApiSpec.Operations.json_request_body("Updated fields", "CreateWarehouseRequest", false),
    responses: %{200 => SyncFlow.Web.ApiSpec.Operations.json_response(200, "Updated warehouse", "Warehouse")}

  operation :delete,
    summary: "Deactivate warehouse",
    parameters: [SyncFlow.Web.ApiSpec.Operations.id_path_param()],
    responses: %{204 => %OpenApiSpex.Response{description: "Deactivated"}}

  operation :inventory_value,
    summary: "Total inventory value",
    description: "Returns the total monetary value of all active stock across all warehouses, plus total item count.",
    responses: %{
      200 => SyncFlow.Web.ApiSpec.Operations.json_response(200, "Inventory value snapshot", "InventoryValue")
    }

  # --- Actions ---

  def index(conn, _params) do
    warehouses = Queries.list_warehouses(conn.assigns.current_org_id)
    json(conn, %{data: warehouses})
  end

  def show(conn, %{"id" => id}) do
    case Queries.get_warehouse(id) do
      nil -> conn |> put_status(:not_found) |> json(%{error: "Warehouse not found"})
      wh -> json(conn, %{data: wh})
    end
  end

  def create(conn, params) do
    attrs = Map.put(params, "org_id", conn.assigns.current_org_id)

    case Queries.create_warehouse(attrs) do
      {:ok, wh} ->
        conn |> put_status(:created) |> json(%{data: wh})

      {:error, cs} ->
        conn |> put_status(:unprocessable_entity) |> json(%{errors: format_errors(cs)})
    end
  end

  def update(conn, %{"id" => id} = params) do
    with wh when not is_nil(wh) <- Queries.get_warehouse(id),
         {:ok, updated} <- Queries.update_warehouse(wh, params) do
      json(conn, %{data: updated})
    else
      nil -> conn |> put_status(:not_found) |> json(%{error: "Not found"})
      {:error, cs} -> conn |> put_status(:unprocessable_entity) |> json(%{errors: format_errors(cs)})
    end
  end

  def delete(conn, %{"id" => id}) do
    case Queries.get_warehouse(id) do
      nil ->
        conn |> put_status(:not_found) |> json(%{error: "Not found"})

      wh ->
        {:ok, _} = Queries.update_warehouse(wh, %{is_active: false})
        conn |> put_status(:no_content) |> json(%{})
    end
  end

  def inventory_value(conn, _params) do
    org_id = conn.assigns.current_org_id
    value = Queries.inventory_value(org_id)
    low_stock_count = length(Queries.low_stock_items(org_id))

    json(conn, %{
      data: %{
        total_items: value[:total_items] || 0,
        total_value: value[:total_value] || Decimal.new("0"),
        currency: "RWF",
        low_stock_count: low_stock_count,
        snapshot_at: DateTime.utc_now()
      }
    })
  end

  defp format_errors(cs) do
    Ecto.Changeset.traverse_errors(cs, fn {msg, opts} ->
      Enum.reduce(opts, msg, fn {k, v}, acc -> String.replace(acc, "%{#{k}}", to_string(v)) end)
    end)
  end
end
