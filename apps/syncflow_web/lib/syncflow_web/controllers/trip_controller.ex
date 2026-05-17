defmodule SyncFlow.Web.Controllers.TripController do
  use Phoenix.Controller, formats: [:json]
  use OpenApiSpex.ControllerSpecs

  alias OpenApiSpex.{Parameter, Schema}
  alias SyncFlow.Fleet.Queries

  tags ["Trips"]
  security [%{"bearerAuth" => []}]

  operation :index,
    summary: "List trips",
    description: "Returns trip history. Filter by vehicle or status.",
    parameters: [
      %Parameter{name: :vehicle_id, in: :query, schema: %Schema{type: :string, format: :uuid}},
      %Parameter{name: :status, in: :query, schema: %Schema{type: :string, enum: ~w(in_progress completed cancelled)}},
      %Parameter{name: :page, in: :query, schema: %Schema{type: :integer, default: 1}}
    ],
    responses: %{200 => SyncFlow.Web.ApiSpec.Operations.json_response(200, "Trips", "PaginatedResponse")}

  operation :show,
    summary: "Get trip details",
    parameters: [SyncFlow.Web.ApiSpec.Operations.id_path_param("Trip UUID")],
    responses: %{
      200 => SyncFlow.Web.ApiSpec.Operations.json_response(200, "Trip details", "Trip"),
      404 => SyncFlow.Web.ApiSpec.Operations.json_response(404, "Not found", "ErrorResponse")
    }

  # --- Actions ---

  def index(conn, params) do
    trips =
      Queries.list_trips(
        vehicle_id: params["vehicle_id"],
        status: params["status"],
        page: parse_int(params["page"], 1)
      )

    json(conn, %{data: trips})
  end

  def show(conn, %{"id" => id}) do
    case Queries.get_trip(id) do
      nil -> conn |> put_status(:not_found) |> json(%{error: "Trip not found"})
      trip -> json(conn, %{data: trip})
    end
  end

  defp parse_int(nil, d), do: d
  defp parse_int(v, _), do: String.to_integer(v)
end
