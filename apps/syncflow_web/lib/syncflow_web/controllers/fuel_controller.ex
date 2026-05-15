defmodule SyncFlow.Web.Controllers.FuelController do
  use Phoenix.Controller, formats: [:json]

  alias SyncFlow.Core.CommandedApp
  alias SyncFlow.Fleet.Commands

  def log(conn, params) do
    cmd = %Commands.LogFuelEvent{
      vehicle_id: params["vehicle_id"],
      liters: params["liters"],
      cost_per_liter: params["cost_per_liter"],
      total_cost: params["total_cost"],
      currency: params["currency"] || "RWF",
      station: params["station"],
      odometer: params["odometer"],
      logged_by: conn.assigns.current_user.id
    }

    case CommandedApp.dispatch(cmd) do
      :ok ->
        conn |> put_status(:created) |> json(%{data: %{status: "logged"}})

      {:error, reason} ->
        conn |> put_status(:unprocessable_entity) |> json(%{error: to_string(reason)})
    end
  end
end
