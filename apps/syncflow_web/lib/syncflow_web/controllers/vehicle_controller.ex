defmodule SyncFlow.Web.Controllers.VehicleController do
  use Phoenix.Controller, formats: [:json]
  use OpenApiSpex.ControllerSpecs

  alias OpenApiSpex.{Parameter, Schema}
  alias SyncFlow.Web.Dispatch, as: CommandedApp
  alias SyncFlow.Fleet.{Commands, Queries, Tracker}

  tags ["Fleet"]
  security [%{"bearerAuth" => []}]

  operation :index,
    summary: "List vehicles",
    parameters: [
      %Parameter{name: :status, in: :query, schema: %Schema{type: :string, enum: ~w(available on_trip maintenance inactive)}},
      %Parameter{name: :page, in: :query, schema: %Schema{type: :integer, default: 1}}
    ],
    responses: %{200 => SyncFlow.Web.ApiSpec.Operations.json_response(200, "Vehicle list", "PaginatedResponse")}

  operation :show,
    summary: "Get vehicle with live GPS location",
    parameters: [SyncFlow.Web.ApiSpec.Operations.id_path_param("Vehicle UUID")],
    responses: %{
      200 => SyncFlow.Web.ApiSpec.Operations.json_response(200, "Vehicle + live location", "Vehicle"),
      404 => SyncFlow.Web.ApiSpec.Operations.json_response(404, "Not found", "ErrorResponse")
    }

  operation :create,
    summary: "Register vehicle",
    request_body: SyncFlow.Web.ApiSpec.Operations.json_request_body("Vehicle data", "CreateVehicleRequest"),
    responses: %{
      201 => SyncFlow.Web.ApiSpec.Operations.json_response(201, "Vehicle registered", "Vehicle"),
      422 => SyncFlow.Web.ApiSpec.Operations.json_response(422, "Validation error", "ErrorResponse")
    }

  operation :update,
    summary: "Update vehicle metadata",
    parameters: [SyncFlow.Web.ApiSpec.Operations.id_path_param()],
    responses: %{200 => SyncFlow.Web.ApiSpec.Operations.json_response(200, "Updated vehicle", "Vehicle")}

  operation :delete,
    summary: "Deactivate vehicle",
    parameters: [SyncFlow.Web.ApiSpec.Operations.id_path_param()],
    responses: %{204 => %OpenApiSpex.Response{description: "Deactivated"}}

  operation :assign_driver,
    summary: "Assign driver to vehicle",
    parameters: [SyncFlow.Web.ApiSpec.Operations.id_path_param("Vehicle UUID")],
    request_body: SyncFlow.Web.ApiSpec.Operations.json_request_body("Driver info", "AssignDriverRequest"),
    responses: %{200 => SyncFlow.Web.ApiSpec.Operations.json_response(200, "Driver assigned", "Vehicle")}

  operation :live_positions,
    summary: "All active vehicle GPS positions",
    description: "Returns live positions from in-memory ETS cache (~1 Hz update frequency). Subscribe to `fleet:live` WebSocket channel for real-time streaming.",
    responses: %{200 => SyncFlow.Web.ApiSpec.Operations.json_response(200, "Live positions", "LiveVehiclePositionList")}

  operation :summary,
    summary: "Fleet status summary",
    description: "Count of vehicles grouped by status (available, on_trip, maintenance, inactive) plus total fuel costs.",
    responses: %{200 => SyncFlow.Web.ApiSpec.Operations.json_response(200, "Fleet summary", "FleetSummary")}

  # --- Actions ---

  def index(conn, params) do
    vehicles =
      Queries.list_vehicles(conn.assigns.current_org_id,
        status: params["status"],
        page: parse_int(params["page"], 1)
      )

    json(conn, %{data: vehicles})
  end

  def show(conn, %{"id" => id}) do
    case Queries.get_vehicle(id) do
      nil ->
        conn |> put_status(:not_found) |> json(%{error: "Vehicle not found"})

      vehicle ->
        location =
          case Tracker.get_location(id) do
            {:ok, loc} -> loc
            _ -> nil
          end

        json(conn, %{data: vehicle, live_location: location})
    end
  end

  def create(conn, params) do
    cmd = %Commands.RegisterVehicle{
      vehicle_id: UUID.uuid4(),
      org_id: conn.assigns.current_org_id,
      plate_number: params["plate_number"],
      make: params["make"],
      model: params["model"],
      year: params["year"],
      type: params["type"],
      registered_by: conn.assigns.current_user.id
    }

    case CommandedApp.dispatch(cmd) do
      :ok ->
        conn |> put_status(:created) |> json(%{data: %{vehicle_id: cmd.vehicle_id}})

      {:error, reason} ->
        conn |> put_status(:unprocessable_entity) |> json(%{error: to_string(reason)})
    end
  end

  def update(conn, %{"id" => id} = params) do
    vehicle = Queries.get_vehicle!(id)
    changes = Map.take(params, ["make", "model", "year", "type"])

    case SyncFlow.Fleet.Repo.update(Ecto.Changeset.change(vehicle, atomize(changes))) do
      {:ok, updated} -> json(conn, %{data: updated})
      {:error, cs} -> conn |> put_status(:unprocessable_entity) |> json(%{errors: cs})
    end
  end

  def delete(conn, %{"id" => id}) do
    vehicle = Queries.get_vehicle!(id)
    SyncFlow.Fleet.Repo.update!(Ecto.Changeset.change(vehicle, status: :inactive))
    conn |> put_status(:no_content) |> json(%{})
  end

  def assign_driver(conn, %{"id" => id} = params) do
    cmd = %Commands.AssignDriver{
      vehicle_id: id,
      driver_id: params["driver_id"],
      driver_name: params["driver_name"],
      assigned_by: conn.assigns.current_user.id
    }

    case CommandedApp.dispatch(cmd) do
      :ok -> json(conn, %{data: %{status: "driver_assigned"}})
      {:error, reason} -> conn |> put_status(:unprocessable_entity) |> json(%{error: to_string(reason)})
    end
  end

  def live_positions(conn, _params) do
    vehicles = Tracker.all_active_vehicles()
    json(conn, %{data: vehicles, count: length(vehicles)})
  end

  def summary(conn, _params) do
    org_id = conn.assigns.current_org_id
    status_counts = Queries.fleet_summary(org_id)
    fuel_by_vehicle = Queries.fuel_cost_by_vehicle(org_id)

    total_fuel_cost =
      Enum.reduce(fuel_by_vehicle, Decimal.new("0"), fn row, acc ->
        Decimal.add(acc, row.total_cost || Decimal.new("0"))
      end)

    active_now = length(Tracker.all_active_vehicles())

    json(conn, %{
      data: %{
        by_status: status_counts,
        total_vehicles: status_counts |> Map.values() |> Enum.sum(),
        active_on_gps: active_now,
        fuel_cost_by_vehicle: fuel_by_vehicle,
        total_fuel_cost: total_fuel_cost
      }
    })
  end

  defp parse_int(nil, d), do: d
  defp parse_int(v, _), do: String.to_integer(v)

  defp atomize(map) do
    Map.new(map, fn {k, v} -> {String.to_existing_atom(k), v} end)
  end
end
