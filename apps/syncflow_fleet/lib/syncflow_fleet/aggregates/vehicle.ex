defmodule SyncFlow.Fleet.Aggregates.Vehicle do
  alias SyncFlow.Fleet.{Commands, Events}

  defstruct [
    :vehicle_id, :org_id, :plate_number, :driver_id,
    :current_trip_id, :status, :last_location,
    odometer: 0
  ]


  def execute(%__MODULE__{vehicle_id: nil}, %Commands.RegisterVehicle{} = cmd) do
    %Events.VehicleRegistered{
      vehicle_id: cmd.vehicle_id,
      org_id: cmd.org_id,
      plate_number: cmd.plate_number,
      make: cmd.make,
      model: cmd.model,
      year: cmd.year,
      type: cmd.type,
      registered_by: cmd.registered_by,
      registered_at: DateTime.utc_now()
    }
  end

  def execute(%__MODULE__{} = v, %Commands.AssignDriver{} = cmd) do
    %Events.DriverAssigned{
      vehicle_id: v.vehicle_id,
      driver_id: cmd.driver_id,
      driver_name: cmd.driver_name,
      assigned_by: cmd.assigned_by,
      assigned_at: DateTime.utc_now()
    }
  end

  def execute(%__MODULE__{status: :on_trip}, %Commands.StartTrip{}) do
    {:error, :vehicle_already_on_trip}
  end

  def execute(%__MODULE__{} = v, %Commands.StartTrip{} = cmd) do
    %Events.TripStarted{
      vehicle_id: v.vehicle_id,
      trip_id: cmd.trip_id || UUID.uuid4(),
      origin: cmd.origin,
      destination: cmd.destination,
      driver_id: cmd.driver_id || v.driver_id,
      cargo: cmd.cargo,
      started_at: cmd.started_at || DateTime.utc_now()
    }
  end

  def execute(%__MODULE__{} = v, %Commands.UpdateLocation{} = cmd) do
    %Events.LocationUpdated{
      vehicle_id: v.vehicle_id,
      trip_id: v.current_trip_id,
      latitude: cmd.latitude,
      longitude: cmd.longitude,
      speed_kmh: cmd.speed_kmh,
      heading: cmd.heading,
      recorded_at: cmd.recorded_at || DateTime.utc_now()
    }
  end

  def execute(%__MODULE__{current_trip_id: nil}, %Commands.EndTrip{}) do
    {:error, :no_active_trip}
  end

  def execute(%__MODULE__{} = v, %Commands.EndTrip{} = cmd) do
    %Events.TripEnded{
      vehicle_id: v.vehicle_id,
      trip_id: v.current_trip_id,
      odometer_end: cmd.odometer_end,
      ended_at: cmd.ended_at || DateTime.utc_now(),
      notes: cmd.notes
    }
  end

  def execute(%__MODULE__{} = v, %Commands.LogFuelEvent{} = cmd) do
    %Events.FuelLogged{
      vehicle_id: v.vehicle_id,
      event_id: UUID.uuid4(),
      liters: cmd.liters,
      cost_per_liter: cmd.cost_per_liter,
      total_cost: cmd.total_cost,
      currency: cmd.currency || "RWF",
      station: cmd.station,
      odometer: cmd.odometer,
      logged_by: cmd.logged_by,
      logged_at: DateTime.utc_now()
    }
  end

  # State
  def apply(%__MODULE__{} = v, %Events.VehicleRegistered{} = evt) do
    %{v | vehicle_id: evt.vehicle_id, org_id: evt.org_id, plate_number: evt.plate_number, status: :available}
  end

  def apply(%__MODULE__{} = v, %Events.DriverAssigned{driver_id: id}) do
    %{v | driver_id: id}
  end

  def apply(%__MODULE__{} = v, %Events.TripStarted{trip_id: id}) do
    %{v | current_trip_id: id, status: :on_trip}
  end

  def apply(%__MODULE__{} = v, %Events.LocationUpdated{} = evt) do
    %{v | last_location: %{lat: evt.latitude, lng: evt.longitude, speed: evt.speed_kmh}}
  end

  def apply(%__MODULE__{} = v, %Events.TripEnded{odometer_end: odo}) do
    %{v | current_trip_id: nil, status: :available, odometer: odo || v.odometer}
  end

  def apply(v, _), do: v
end
