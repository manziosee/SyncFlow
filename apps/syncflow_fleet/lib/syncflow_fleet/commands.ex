defmodule SyncFlow.Fleet.Commands do
  defmodule RegisterVehicle do
    @derive Jason.Encoder
    defstruct [:vehicle_id, :org_id, :plate_number, :make, :model, :year, :type, :registered_by]
  end

  defmodule AssignDriver do
    @derive Jason.Encoder
    defstruct [:vehicle_id, :driver_id, :driver_name, :assigned_by]
  end

  defmodule StartTrip do
    @derive Jason.Encoder
    defstruct [:vehicle_id, :trip_id, :origin, :destination, :driver_id, :cargo, :started_at]
  end

  defmodule UpdateLocation do
    @derive Jason.Encoder
    defstruct [:vehicle_id, :trip_id, :latitude, :longitude, :speed_kmh, :heading, :recorded_at]
  end

  defmodule EndTrip do
    @derive Jason.Encoder
    defstruct [:vehicle_id, :trip_id, :odometer_end, :ended_at, :notes]
  end

  defmodule LogFuelEvent do
    @derive Jason.Encoder
    defstruct [:vehicle_id, :liters, :cost_per_liter, :total_cost, :currency, :station, :odometer, :logged_by]
  end
end
