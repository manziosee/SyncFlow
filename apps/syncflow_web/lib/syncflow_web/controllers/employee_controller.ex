defmodule SyncFlow.Web.Controllers.EmployeeController do
  use Phoenix.Controller, formats: [:json]
  use OpenApiSpex.ControllerSpecs

  alias OpenApiSpex.{Parameter, Schema}
  alias SyncFlow.HR.Queries

  tags ["Employees"]
  security [%{"bearerAuth" => []}]

  operation :index,
    summary: "List employees",
    parameters: [
      %Parameter{name: :status, in: :query, schema: %Schema{type: :string, enum: ~w(active on_leave terminated probation)}},
      %Parameter{name: :department, in: :query, schema: %Schema{type: :string}},
      %Parameter{name: :search, in: :query, schema: %Schema{type: :string, description: "Search by name, email, or employee number"}},
      %Parameter{name: :page, in: :query, schema: %Schema{type: :integer, default: 1}}
    ],
    responses: %{
      200 => SyncFlow.Web.ApiSpec.Operations.json_response(200, "Employee list", "PaginatedResponse")
    }

  operation :show,
    summary: "Get employee",
    parameters: [SyncFlow.Web.ApiSpec.Operations.id_path_param("Employee UUID")],
    responses: %{
      200 => SyncFlow.Web.ApiSpec.Operations.json_response(200, "Employee details", "Employee"),
      404 => SyncFlow.Web.ApiSpec.Operations.json_response(404, "Not found", "ErrorResponse")
    }

  operation :create,
    summary: "Register employee",
    request_body: SyncFlow.Web.ApiSpec.Operations.json_request_body("Employee data", "CreateEmployeeRequest"),
    responses: %{
      201 => SyncFlow.Web.ApiSpec.Operations.json_response(201, "Employee created", "Employee"),
      422 => SyncFlow.Web.ApiSpec.Operations.json_response(422, "Validation error", "ErrorResponse")
    }

  operation :update,
    summary: "Update employee",
    parameters: [SyncFlow.Web.ApiSpec.Operations.id_path_param()],
    request_body: SyncFlow.Web.ApiSpec.Operations.json_request_body("Updated fields", "CreateEmployeeRequest", false),
    responses: %{200 => SyncFlow.Web.ApiSpec.Operations.json_response(200, "Updated employee", "Employee")}

  operation :delete,
    summary: "Terminate employee (soft delete)",
    parameters: [SyncFlow.Web.ApiSpec.Operations.id_path_param()],
    responses: %{204 => %OpenApiSpex.Response{description: "Terminated"}}

  operation :headcount,
    summary: "Headcount by department",
    description: "Returns active employee counts grouped by department.",
    responses: %{
      200 => SyncFlow.Web.ApiSpec.Operations.json_response(200, "Department headcount", "HeadcountResponse")
    }

  # --- Actions ---

  def index(conn, params) do
    employees =
      Queries.list_employees(conn.assigns.current_org_id,
        status: params["status"],
        department: params["department"],
        search: params["search"],
        page: parse_int(params["page"], 1)
      )

    json(conn, %{data: employees})
  end

  def show(conn, %{"id" => id}) do
    case Queries.get_employee(id) do
      nil -> conn |> put_status(:not_found) |> json(%{error: "Employee not found"})
      emp -> json(conn, %{data: emp})
    end
  end

  def create(conn, params) do
    attrs = Map.put(params, "org_id", conn.assigns.current_org_id)

    case Queries.create_employee(attrs) do
      {:ok, emp} ->
        conn |> put_status(:created) |> json(%{data: emp})

      {:error, cs} ->
        conn |> put_status(:unprocessable_entity) |> json(%{errors: format_errors(cs)})
    end
  end

  def update(conn, %{"id" => id} = params) do
    with emp when not is_nil(emp) <- Queries.get_employee(id),
         {:ok, updated} <- Queries.update_employee(emp, params) do
      json(conn, %{data: updated})
    else
      nil -> conn |> put_status(:not_found) |> json(%{error: "Not found"})
      {:error, cs} -> conn |> put_status(:unprocessable_entity) |> json(%{errors: format_errors(cs)})
    end
  end

  def delete(conn, %{"id" => id}) do
    case Queries.get_employee(id) do
      nil ->
        conn |> put_status(:not_found) |> json(%{error: "Not found"})

      emp ->
        {:ok, _} = Queries.update_employee(emp, %{"status" => "terminated", "termination_date" => Date.utc_today()})
        conn |> put_status(:no_content) |> json(%{})
    end
  end

  def headcount(conn, _params) do
    breakdown = Queries.headcount_by_department(conn.assigns.current_org_id)
    total = breakdown |> Map.values() |> Enum.sum()

    json(conn, %{
      data: %{
        by_department: breakdown,
        total_active: total
      }
    })
  end

  defp parse_int(nil, d), do: d
  defp parse_int(v, _), do: String.to_integer(v)

  defp format_errors(cs) do
    Ecto.Changeset.traverse_errors(cs, fn {msg, opts} ->
      Enum.reduce(opts, msg, fn {k, v}, acc -> String.replace(acc, "%{#{k}}", to_string(v)) end)
    end)
  end
end
