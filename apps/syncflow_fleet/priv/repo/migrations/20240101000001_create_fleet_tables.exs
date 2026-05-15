defmodule SyncFlow.Fleet.Repo.Migrations.CreateFleetTables do
  use Ecto.Migration

  def change do
    create table(:vehicles, primary_key: false) do
      add :id, :binary_id, primary_key: true
      add :org_id, :binary_id, null: false
      add :plate_number, :string, null: false
      add :make, :string
      add :model, :string
      add :year, :integer
      add :type, :string
      add :status, :string, default: "available"
      add :driver_id, :binary_id
      add :driver_name, :string
      add :current_trip_id, :binary_id
      add :odometer, :integer, default: 0
      add :last_latitude, :float
      add :last_longitude, :float
      add :last_seen_at, :utc_datetime
      add :metadata, :jsonb, default: "{}"

      timestamps(type: :utc_datetime)
    end

    create index(:vehicles, [:org_id])
    create index(:vehicles, [:status])
    create unique_index(:vehicles, [:plate_number, :org_id])

    create table(:trips, primary_key: false) do
      add :id, :binary_id, primary_key: true
      add :vehicle_id, references(:vehicles, type: :binary_id), null: false
      add :driver_id, :binary_id
      add :origin, :string
      add :destination, :string
      add :cargo, :jsonb
      add :status, :string, default: "in_progress"
      add :started_at, :utc_datetime
      add :ended_at, :utc_datetime
      add :distance_km, :float
      add :notes, :text

      timestamps(type: :utc_datetime)
    end

    create index(:trips, [:vehicle_id])
    create index(:trips, [:status])
    create index(:trips, [:started_at])

    create table(:fuel_records, primary_key: false) do
      add :id, :binary_id, primary_key: true
      add :vehicle_id, references(:vehicles, type: :binary_id), null: false
      add :liters, :decimal, precision: 10, scale: 2
      add :cost_per_liter, :decimal, precision: 10, scale: 2
      add :total_cost, :decimal, precision: 15, scale: 2
      add :currency, :string, default: "RWF"
      add :station, :string
      add :odometer, :integer
      add :logged_by, :binary_id
      add :logged_at, :utc_datetime

      timestamps(type: :utc_datetime)
    end

    create index(:fuel_records, [:vehicle_id])
    create index(:fuel_records, [:logged_at])
  end
end
