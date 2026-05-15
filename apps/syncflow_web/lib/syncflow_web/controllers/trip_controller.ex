defmodule SyncFlow.Web.Controllers.TripController do
  use Phoenix.Controller, formats: [:json]

  alias SyncFlow.Fleet.Queries

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
