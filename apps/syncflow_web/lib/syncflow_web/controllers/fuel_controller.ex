defmodule SyncFlow.Web.Controllers.FuelController do
  use Phoenix.Controller, formats: [:json]
  use OpenApiSpex.ControllerSpecs

  alias OpenApiSpex.{Parameter, Schema}
  alias SyncFlow.Web.Dispatch, as: CommandedApp
  alias SyncFlow.Fleet.{Commands, Queries}

  tags ["Fleet"]
  security [%{"bearerAuth" => []}]

  operation :index,
    summary: "List fuel records",
    description: "Returns fuel log entries for a specific vehicle. Filter by vehicle_id.",
    parameters: [
      %Parameter{name: :vehicle_id, in: :query, required: true, schema: %Schema{type: :string, format: :uuid}},
      %Parameter{name: :limit, in: :query, schema: %Schema{type: :integer, default: 50}}
    ],
    responses: %{
      200 => SyncFlow.Web.ApiSpec.Operations.json_response(200, "Fuel records", "PaginatedResponse")
    }

  operation :log,
    summary: "Log fuel event",
    description: "Record a fuel fill-up for a vehicle. Dispatches a LogFuelEvent command.",
    request_body: SyncFlow.Web.ApiSpec.Operations.json_request_body("Fuel event data", "FuelLogRequest"),
    responses: %{
      201 => SyncFlow.Web.ApiSpec.Operations.json_response(201, "Fuel event logged", "FuelRecord"),
      422 => SyncFlow.Web.ApiSpec.Operations.json_response(422, "Validation error", "ErrorResponse")
    }

  # --- Actions ---

  def index(conn, params) do
    vehicle_id = params["vehicle_id"]

    if is_nil(vehicle_id) do
      conn |> put_status(:bad_request) |> json(%{error: "vehicle_id is required"})
    else
      limit = parse_int(params["limit"], 50)
      records = Queries.list_fuel_records(vehicle_id, limit: limit)
      json(conn, %{data: records, count: length(records)})
    end
  end

  def log(conn, params) do
    cmd = %Commands.LogFuelEvent{
      vehicle_id: params["vehicle_id"],
      liters: params["liters"],
      cost_per_liter: params["cost_per_liter"],
      total_cost: params["total_cost"],
      currency: params["currency"] || "RWF",
      station: params["station"],
      odometer: params["odometer"],
      logged_by: conn.assigns.current_user.id
    }

    case CommandedApp.dispatch(cmd) do
      :ok ->
        conn |> put_status(:created) |> json(%{data: %{status: "logged"}})

      {:error, reason} ->
        conn |> put_status(:unprocessable_entity) |> json(%{error: to_string(reason)})
    end
  end

  defp parse_int(nil, d), do: d
  defp parse_int(v, _), do: String.to_integer(v)
end
