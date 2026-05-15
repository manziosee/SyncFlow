defmodule SyncFlow.Fleet.Events do
  defmodule VehicleRegistered do
    @derive Jason.Encoder
    defstruct [:vehicle_id, :org_id, :plate_number, :make, :model, :year, :type, :registered_by, :registered_at]
  end

  defmodule DriverAssigned do
    @derive Jason.Encoder
    defstruct [:vehicle_id, :driver_id, :driver_name, :assigned_by, :assigned_at]
  end

  defmodule TripStarted do
    @derive Jason.Encoder
    defstruct [:vehicle_id, :trip_id, :origin, :destination, :driver_id, :cargo, :started_at]
  end

  defmodule LocationUpdated do
    @derive Jason.Encoder
    defstruct [:vehicle_id, :trip_id, :latitude, :longitude, :speed_kmh, :heading, :recorded_at]
  end

  defmodule TripEnded do
    @derive Jason.Encoder
    defstruct [:vehicle_id, :trip_id, :distance_km, :duration_minutes, :odometer_end, :ended_at, :notes]
  end

  defmodule FuelLogged do
    @derive Jason.Encoder
    defstruct [:vehicle_id, :event_id, :liters, :cost_per_liter, :total_cost, :currency,
               :station, :odometer, :logged_by, :logged_at]
  end
end
