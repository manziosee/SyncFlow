defmodule SyncFlow.Fleet.Queries do
  import Ecto.Query
  alias SyncFlow.Fleet.Repo
  alias SyncFlow.Fleet.Schema.{Vehicle, Trip, FuelRecord}

  def list_vehicles(org_id, opts \\ []) do
    status = Keyword.get(opts, :status)
    page = Keyword.get(opts, :page, 1)
    per_page = Keyword.get(opts, :per_page, 50)

    Vehicle
    |> where([v], v.org_id == ^org_id)
    |> maybe_filter_status(status)
    |> order_by([v], v.plate_number)
    |> paginate(page, per_page)
    |> Repo.all()
  end

  def get_vehicle(id), do: Repo.get(Vehicle, id)
  def get_vehicle!(id), do: Repo.get!(Vehicle, id)

  def list_trips(opts \\ []) do
    vehicle_id = Keyword.get(opts, :vehicle_id)
    status = Keyword.get(opts, :status)
    page = Keyword.get(opts, :page, 1)
    per_page = Keyword.get(opts, :per_page, 20)

    Trip
    |> maybe_filter_vehicle(vehicle_id)
    |> maybe_filter_trip_status(status)
    |> order_by([t], desc: t.started_at)
    |> paginate(page, per_page)
    |> Repo.all()
  end

  def get_trip(id), do: Repo.get(Trip, id)

  def list_fuel_records(vehicle_id, opts \\ []) do
    limit = Keyword.get(opts, :limit, 50)

    FuelRecord
    |> where([f], f.vehicle_id == ^vehicle_id)
    |> order_by([f], desc: f.logged_at)
    |> limit(^limit)
    |> Repo.all()
  end

  def fleet_summary(org_id) do
    Vehicle
    |> where([v], v.org_id == ^org_id)
    |> group_by([v], v.status)
    |> select([v], {v.status, count(v.id)})
    |> Repo.all()
    |> Map.new()
  end

  def fuel_cost_by_vehicle(org_id) do
    from(f in FuelRecord,
      join: v in Vehicle, on: v.id == f.vehicle_id,
      where: v.org_id == ^org_id,
      group_by: [f.vehicle_id, v.plate_number],
      select: %{
        vehicle_id: f.vehicle_id,
        plate_number: v.plate_number,
        total_liters: sum(f.liters),
        total_cost: sum(f.total_cost)
      }
    )
    |> Repo.all()
  end

  defp maybe_filter_status(q, nil), do: q
  defp maybe_filter_status(q, s), do: where(q, [v], v.status == ^s)

  defp maybe_filter_vehicle(q, nil), do: q
  defp maybe_filter_vehicle(q, id), do: where(q, [t], t.vehicle_id == ^id)

  defp maybe_filter_trip_status(q, nil), do: q
  defp maybe_filter_trip_status(q, s), do: where(q, [t], t.status == ^s)

  defp paginate(q, page, per_page) do
    q |> limit(^per_page) |> offset(^((page - 1) * per_page))
  end
end
