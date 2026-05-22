defmodule SyncFlow.Fleet.Schema.Vehicle do
  use Ecto.Schema
  @derive {Jason.Encoder, except: [:__meta__]}

  @primary_key {:id, :binary_id, autogenerate: false}

  schema "vehicles" do
    field :org_id, :binary_id
    field :plate_number, :string
    field :make, :string
    field :model, :string
    field :year, :integer
    field :type, Ecto.Enum, values: [:truck, :van, :motorcycle, :car, :bus]
    field :status, Ecto.Enum, values: [:available, :on_trip, :maintenance, :inactive], default: :available
    field :driver_id, :binary_id
    field :driver_name, :string
    field :current_trip_id, :binary_id
    field :odometer, :integer, default: 0
    field :last_latitude, :float
    field :last_longitude, :float
    field :last_seen_at, :utc_datetime
    field :metadata, :map, default: %{}

    timestamps(type: :utc_datetime)
  end
end

defmodule SyncFlow.Fleet.Schema.Trip do
  use Ecto.Schema
  @derive {Jason.Encoder, except: [:__meta__]}

  @primary_key {:id, :binary_id, autogenerate: false}

  schema "trips" do
    field :vehicle_id, :binary_id
    field :driver_id, :binary_id
    field :origin, :string
    field :destination, :string
    field :cargo, :map
    field :status, Ecto.Enum, values: [:in_progress, :completed, :cancelled], default: :in_progress
    field :started_at, :utc_datetime
    field :ended_at, :utc_datetime
    field :distance_km, :float
    field :notes, :string

    timestamps(type: :utc_datetime)
  end
end

defmodule SyncFlow.Fleet.Schema.FuelRecord do
  use Ecto.Schema
  @derive {Jason.Encoder, except: [:__meta__]}

  @primary_key {:id, :binary_id, autogenerate: false}

  schema "fuel_records" do
    field :vehicle_id, :binary_id
    field :liters, :decimal
    field :cost_per_liter, :decimal
    field :total_cost, :decimal
    field :currency, :string, default: "RWF"
    field :station, :string
    field :odometer, :integer
    field :logged_by, :binary_id
    field :logged_at, :utc_datetime

    timestamps(type: :utc_datetime)
  end
end
