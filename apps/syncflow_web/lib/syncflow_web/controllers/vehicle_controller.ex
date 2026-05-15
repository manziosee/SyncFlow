defmodule SyncFlow.Web.Controllers.VehicleController do
  use Phoenix.Controller, formats: [:json]

  alias SyncFlow.Core.CommandedApp
  alias SyncFlow.Fleet.{Commands, Queries, Tracker}

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

  defp parse_int(nil, d), do: d
  defp parse_int(v, _), do: String.to_integer(v)

  defp atomize(map) do
    Map.new(map, fn {k, v} -> {String.to_existing_atom(k), v} end)
  end
end
