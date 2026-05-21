defmodule SyncFlow.Web.Controllers.CustomerController do
  use Phoenix.Controller, formats: [:json]
  use OpenApiSpex.ControllerSpecs

  alias OpenApiSpex.{Parameter, Schema}
  alias SyncFlow.Web.Dispatch, as: CommandedApp
  alias SyncFlow.CRM.{Commands, Queries}

  tags ["Customers"]
  security [%{"bearerAuth" => []}]

  operation :index,
    summary: "List customers",
    parameters: [
      %Parameter{name: :status, in: :query, schema: %Schema{type: :string, enum: ~w(active inactive blocked)}},
      %Parameter{name: :type, in: :query, schema: %Schema{type: :string, enum: ~w(individual business)}},
      %Parameter{name: :search, in: :query, schema: %Schema{type: :string}},
      %Parameter{name: :page, in: :query, schema: %Schema{type: :integer, default: 1}}
    ],
    responses: %{
      200 => SyncFlow.Web.ApiSpec.Operations.json_response(200, "Customer list", "PaginatedResponse")
    }

  operation :show,
    summary: "Get customer with recent interactions",
    parameters: [SyncFlow.Web.ApiSpec.Operations.id_path_param("Customer UUID")],
    responses: %{
      200 => SyncFlow.Web.ApiSpec.Operations.json_response(200, "Customer details", "Customer"),
      404 => SyncFlow.Web.ApiSpec.Operations.json_response(404, "Not found", "ErrorResponse")
    }

  operation :create,
    summary: "Register customer",
    request_body: SyncFlow.Web.ApiSpec.Operations.json_request_body("Customer data", "CreateCustomerRequest"),
    responses: %{
      201 => SyncFlow.Web.ApiSpec.Operations.json_response(201, "Customer registered", "Customer"),
      422 => SyncFlow.Web.ApiSpec.Operations.json_response(422, "Validation error", "ErrorResponse")
    }

  operation :update,
    summary: "Update customer",
    parameters: [SyncFlow.Web.ApiSpec.Operations.id_path_param()],
    request_body: SyncFlow.Web.ApiSpec.Operations.json_request_body("Updated fields", "CreateCustomerRequest", false),
    responses: %{200 => SyncFlow.Web.ApiSpec.Operations.json_response(200, "Updated", "Customer")}

  operation :delete,
    summary: "Deactivate customer",
    parameters: [SyncFlow.Web.ApiSpec.Operations.id_path_param()],
    responses: %{204 => %OpenApiSpex.Response{description: "Deactivated"}}

  operation :record_interaction,
    summary: "Record customer interaction",
    description: "Log a call, email, meeting, visit, or note against a customer.",
    parameters: [SyncFlow.Web.ApiSpec.Operations.id_path_param("Customer UUID")],
    request_body: SyncFlow.Web.ApiSpec.Operations.json_request_body("Interaction data", "RecordInteractionRequest"),
    responses: %{
      201 => SyncFlow.Web.ApiSpec.Operations.json_response(201, "Recorded", "Interaction"),
      422 => SyncFlow.Web.ApiSpec.Operations.json_response(422, "Error", "ErrorResponse")
    }

  operation :interactions,
    summary: "List customer interactions",
    description: "Returns interaction history for a customer (calls, emails, meetings).",
    parameters: [
      SyncFlow.Web.ApiSpec.Operations.id_path_param("Customer UUID"),
      %Parameter{name: :limit, in: :query, schema: %Schema{type: :integer, default: 20}}
    ],
    responses: %{
      200 => SyncFlow.Web.ApiSpec.Operations.json_response(200, "Interactions", "PaginatedResponse"),
      404 => SyncFlow.Web.ApiSpec.Operations.json_response(404, "Customer not found", "ErrorResponse")
    }

  operation :stats,
    summary: "Customer stats by status",
    description: "Count of customers grouped by status (active, inactive, blocked).",
    responses: %{
      200 => SyncFlow.Web.ApiSpec.Operations.json_response(200, "Customer statistics", "CustomerStats")
    }

  # --- Actions ---

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

  def interactions(conn, %{"id" => id} = params) do
    case Queries.get_customer(id) do
      nil ->
        conn |> put_status(:not_found) |> json(%{error: "Customer not found"})

      _customer ->
        limit = parse_int(params["limit"], 20)
        items = Queries.list_interactions(id, limit: limit)
        json(conn, %{data: items, count: length(items)})
    end
  end

  def stats(conn, _params) do
    data = Queries.customer_stats(conn.assigns.current_org_id)
    total = data |> Map.values() |> Enum.sum()
    json(conn, %{data: Map.put(data, :total, total)})
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
