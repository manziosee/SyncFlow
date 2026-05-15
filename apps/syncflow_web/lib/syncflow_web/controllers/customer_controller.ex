defmodule SyncFlow.Web.Controllers.CustomerController do
  use Phoenix.Controller, formats: [:json]

  alias SyncFlow.Core.CommandedApp
  alias SyncFlow.CRM.{Commands, Queries}

  def index(conn, params) do
    customers =
      Queries.list_customers(conn.assigns.current_org_id,
        status: params["status"],
        type: params["type"],
        search: params["search"],
        page: parse_int(params["page"], 1)
      )

    json(conn, %{data: customers})
  end

  def show(conn, %{"id" => id}) do
    case Queries.get_customer(id) do
      nil ->
        conn |> put_status(:not_found) |> json(%{error: "Customer not found"})

      customer ->
        interactions = Queries.list_interactions(id, limit: 10)
        json(conn, %{data: customer, recent_interactions: interactions})
    end
  end

  def create(conn, params) do
    cmd = %Commands.RegisterCustomer{
      customer_id: UUID.uuid4(),
      org_id: conn.assigns.current_org_id,
      name: params["name"],
      email: params["email"],
      phone: params["phone"],
      type: params["type"] || "individual",
      address: params["address"],
      created_by: conn.assigns.current_user.id
    }

    case CommandedApp.dispatch(cmd) do
      :ok ->
        conn |> put_status(:created) |> json(%{data: %{customer_id: cmd.customer_id}})

      {:error, reason} ->
        conn |> put_status(:unprocessable_entity) |> json(%{error: to_string(reason)})
    end
  end

  def update(conn, %{"id" => id} = params) do
    cmd = %Commands.UpdateCustomer{
      customer_id: id,
      name: params["name"],
      email: params["email"],
      phone: params["phone"],
      address: params["address"],
      updated_by: conn.assigns.current_user.id
    }

    case CommandedApp.dispatch(cmd) do
      :ok -> json(conn, %{data: %{status: "updated"}})
      {:error, reason} -> conn |> put_status(:unprocessable_entity) |> json(%{error: to_string(reason)})
    end
  end

  def delete(conn, %{"id" => id}) do
    cmd = %Commands.ChangeCustomerStatus{
      customer_id: id,
      status: :inactive,
      reason: "deleted via API",
      changed_by: conn.assigns.current_user.id
    }

    case CommandedApp.dispatch(cmd) do
      :ok -> conn |> put_status(:no_content) |> json(%{})
      {:error, reason} -> conn |> put_status(:unprocessable_entity) |> json(%{error: to_string(reason)})
    end
  end

  def record_interaction(conn, %{"id" => id} = params) do
    cmd = %Commands.RecordInteraction{
      customer_id: id,
      type: params["type"],
      notes: params["notes"],
      outcome: params["outcome"],
      recorded_by: conn.assigns.current_user.id,
      occurred_at: params["occurred_at"] && parse_datetime(params["occurred_at"])
    }

    case CommandedApp.dispatch(cmd) do
      :ok -> conn |> put_status(:created) |> json(%{data: %{status: "recorded"}})
      {:error, reason} -> conn |> put_status(:unprocessable_entity) |> json(%{error: to_string(reason)})
    end
  end

  defp parse_int(nil, d), do: d
  defp parse_int(v, _), do: String.to_integer(v)

  defp parse_datetime(nil), do: nil
  defp parse_datetime(str) do
    case DateTime.from_iso8601(str) do
      {:ok, dt, _} -> dt
      _ -> nil
    end
  end
end
