defmodule SyncFlow.Fleet.Projectors.VehicleProjector do
  use Commanded.Projections.Ecto,
    application: SyncFlow.Core.CommandedApp,
    repo: SyncFlow.Fleet.Repo,
    name: "vehicle_projector",
    consistency: :strong

  import Ecto.Query
  alias SyncFlow.Fleet.Events
  alias SyncFlow.Fleet.Schema.{Vehicle, Trip, FuelRecord}

  project(%Events.VehicleRegistered{} = evt, _meta, fn multi ->
    Ecto.Multi.insert(multi, :vehicle, %Vehicle{
      id: evt.vehicle_id,
      org_id: evt.org_id,
      plate_number: evt.plate_number,
      make: evt.make,
      model: evt.model,
      year: evt.year,
      type: evt.type,
      status: :available
    })
  end)

  project(%Events.DriverAssigned{} = evt, _meta, fn multi ->
    Ecto.Multi.update_all(multi, :vehicle,
      from(v in Vehicle, where: v.id == ^evt.vehicle_id),
      set: [driver_id: evt.driver_id, driver_name: evt.driver_name]
    )
  end)

  project(%Events.TripStarted{} = evt, _meta, fn multi ->
    multi
    |> Ecto.Multi.insert(:trip, %Trip{
      id: evt.trip_id,
      vehicle_id: evt.vehicle_id,
      driver_id: evt.driver_id,
      origin: evt.origin,
      destination: evt.destination,
      cargo: evt.cargo,
      status: :in_progress,
      started_at: evt.started_at
    })
    |> Ecto.Multi.update_all(:vehicle,
      from(v in Vehicle, where: v.id == ^evt.vehicle_id),
      set: [status: :on_trip, current_trip_id: evt.trip_id]
    )
  end)

  project(%Events.LocationUpdated{} = evt, _meta, fn multi ->
    SyncFlow.Fleet.Tracker.update_location(
      evt.vehicle_id, evt.latitude, evt.longitude, evt.speed_kmh, evt.heading
    )

    Ecto.Multi.update_all(multi, :vehicle,
      from(v in Vehicle, where: v.id == ^evt.vehicle_id),
      set: [
        last_latitude: evt.latitude,
        last_longitude: evt.longitude,
        last_seen_at: evt.recorded_at
      ]
    )
  end)

  project(%Events.TripEnded{} = evt, _meta, fn multi ->
    multi
    |> Ecto.Multi.update_all(:trip,
      from(t in Trip, where: t.id == ^evt.trip_id),
      set: [status: :completed, ended_at: evt.ended_at, notes: evt.notes]
    )
    |> Ecto.Multi.update_all(:vehicle,
      from(v in Vehicle, where: v.id == ^evt.vehicle_id),
      set: [status: :available, current_trip_id: nil, odometer: evt.odometer_end]
    )
  end)

  project(%Events.FuelLogged{} = evt, _meta, fn multi ->
    Ecto.Multi.insert(multi, :fuel, %FuelRecord{
      id: evt.event_id,
      vehicle_id: evt.vehicle_id,
      liters: evt.liters,
      cost_per_liter: evt.cost_per_liter,
      total_cost: evt.total_cost,
      currency: evt.currency,
      station: evt.station,
      odometer: evt.odometer,
      logged_by: evt.logged_by,
      logged_at: evt.logged_at
    })
  end)

  @impl true
  def after_update(%Events.TripStarted{} = evt, _, _) do
    Phoenix.PubSub.broadcast(SyncFlow.PubSub, "fleet:live", {:trip_started, evt})
    :ok
  end

  def after_update(%Events.TripEnded{} = evt, _, _) do
    Phoenix.PubSub.broadcast(SyncFlow.PubSub, "fleet:live", {:trip_ended, evt})
    :ok
  end

  def after_update(_, _, _), do: :ok
end
