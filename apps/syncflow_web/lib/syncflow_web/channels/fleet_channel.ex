defmodule SyncFlow.Web.Channels.FleetChannel do
  @moduledoc """
  Real-time fleet tracking channel.
  Drivers push GPS coordinates; dispatchers and the map UI receive them instantly.
  """

  use Phoenix.Channel
  alias SyncFlow.Fleet.Tracker
  alias SyncFlow.Web.Dispatch, as: CommandedApp
  alias SyncFlow.Fleet.Commands

  def join("fleet:live", _params, socket) do
    Phoenix.PubSub.subscribe(SyncFlow.PubSub, "fleet:live")
    vehicles = Tracker.all_active_vehicles()
    {:ok, %{vehicles: vehicles}, socket}
  end

  def join("fleet:vehicle:" <> vehicle_id, _params, socket) do
    Phoenix.PubSub.subscribe(SyncFlow.PubSub, "fleet:live")
    socket = assign(socket, :vehicle_id, vehicle_id)

    location =
      case Tracker.get_location(vehicle_id) do
        {:ok, loc} -> loc
        _ -> nil
      end

    {:ok, %{vehicle_id: vehicle_id, location: location}, socket}
  end

  # Driver sends GPS ping
  def handle_in("location_ping", %{"lat" => lat, "lng" => lng, "speed" => speed, "heading" => heading}, socket) do
    vehicle_id = socket.assigns[:vehicle_id]

    if vehicle_id do
      cmd = %Commands.UpdateLocation{
        vehicle_id: vehicle_id,
        latitude: lat,
        longitude: lng,
        speed_kmh: speed,
        heading: heading,
        recorded_at: DateTime.utc_now()
      }

      CommandedApp.dispatch(cmd, consistency: :eventual)
    end

    {:noreply, socket}
  end

  def handle_in("start_trip", params, socket) do
    cmd = %Commands.StartTrip{
      vehicle_id: params["vehicle_id"],
      trip_id: UUID.uuid4(),
      origin: params["origin"],
      destination: params["destination"],
      driver_id: socket.assigns.user_id,
      cargo: params["cargo"]
    }

    case CommandedApp.dispatch(cmd) do
      :ok -> {:reply, :ok, socket}
      {:error, reason} -> {:reply, {:error, %{reason: to_string(reason)}}, socket}
    end
  end

  def handle_in("end_trip", params, socket) do
    cmd = %Commands.EndTrip{
      vehicle_id: params["vehicle_id"],
      odometer_end: params["odometer"],
      notes: params["notes"]
    }

    case CommandedApp.dispatch(cmd) do
      :ok -> {:reply, :ok, socket}
      {:error, reason} -> {:reply, {:error, %{reason: to_string(reason)}}, socket}
    end
  end

  def handle_info({:location_updated, entry}, socket) do
    push(socket, "vehicle_moved", entry)
    {:noreply, socket}
  end

  def handle_info({:trip_started, evt}, socket) do
    push(socket, "trip_started", %{vehicle_id: evt.vehicle_id, trip_id: evt.trip_id, destination: evt.destination})
    {:noreply, socket}
  end

  def handle_info({:trip_ended, evt}, socket) do
    push(socket, "trip_ended", %{vehicle_id: evt.vehicle_id, trip_id: evt.trip_id})
    {:noreply, socket}
  end

  def handle_info(_, socket), do: {:noreply, socket}
end
