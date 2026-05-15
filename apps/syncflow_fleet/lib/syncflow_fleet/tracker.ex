defmodule SyncFlow.Fleet.Tracker do
  @moduledoc """
  In-memory ETS table holding the latest GPS location for every active vehicle.
  Channel pushes go through here to avoid hitting the DB for every location ping.
  """
  use GenServer

  @table :fleet_tracker

  def start_link(_), do: GenServer.start_link(__MODULE__, [], name: __MODULE__)

  def update_location(vehicle_id, lat, lng, speed, heading) do
    entry = %{
      vehicle_id: vehicle_id,
      latitude: lat,
      longitude: lng,
      speed_kmh: speed,
      heading: heading,
      updated_at: DateTime.utc_now()
    }

    :ets.insert(@table, {vehicle_id, entry})
    Phoenix.PubSub.broadcast(SyncFlow.PubSub, "fleet:live", {:location_updated, entry})
    entry
  end

  def get_location(vehicle_id) do
    case :ets.lookup(@table, vehicle_id) do
      [{^vehicle_id, entry}] -> {:ok, entry}
      [] -> {:error, :not_found}
    end
  end

  def all_active_vehicles do
    :ets.tab2list(@table) |> Enum.map(fn {_, entry} -> entry end)
  end

  @impl true
  def init(_) do
    :ets.new(@table, [:named_table, :public, :set])
    {:ok, %{}}
  end
end
