defmodule SyncFlow.Web.Controllers.PayrollController do
  use Phoenix.Controller, formats: [:json]
  use OpenApiSpex.ControllerSpecs

  alias OpenApiSpex.{Parameter, Schema}
  alias SyncFlow.HR.Queries
  alias SyncFlow.Core.Workers.{PayrollWorker, NotificationWorker}

  tags ["Payroll"]
  security [%{"bearerAuth" => []}]

  operation :index,
    summary: "List payroll runs",
    parameters: [
      %Parameter{name: :status, in: :query, schema: %Schema{type: :string, enum: ~w(draft processing approved paid cancelled)}},
      %Parameter{name: :page, in: :query, schema: %Schema{type: :integer, default: 1}}
    ],
    responses: %{
      200 => SyncFlow.Web.ApiSpec.Operations.json_response(200, "Payroll runs", "PaginatedResponse")
    }

  operation :show,
    summary: "Get payroll run",
    parameters: [SyncFlow.Web.ApiSpec.Operations.id_path_param("Payroll run UUID")],
    responses: %{
      200 => SyncFlow.Web.ApiSpec.Operations.json_response(200, "Payroll run details", "PayrollRun"),
      404 => SyncFlow.Web.ApiSpec.Operations.json_response(404, "Not found", "ErrorResponse")
    }

  operation :create,
    summary: "Create payroll run",
    description: "Creates a new payroll run for the given period. Call /process to calculate PAYE.",
    request_body: SyncFlow.Web.ApiSpec.Operations.json_request_body("Payroll period", "CreatePayrollRunRequest"),
    responses: %{
      201 => SyncFlow.Web.ApiSpec.Operations.json_response(201, "Payroll run created", "PayrollRun"),
      422 => SyncFlow.Web.ApiSpec.Operations.json_response(422, "Validation error", "ErrorResponse")
    }

  operation :update,
    summary: "Update payroll run notes",
    parameters: [SyncFlow.Web.ApiSpec.Operations.id_path_param()],
    responses: %{200 => SyncFlow.Web.ApiSpec.Operations.json_response(200, "Updated", "PayrollRun")}

  operation :delete,
    summary: "Cancel draft payroll run",
    parameters: [SyncFlow.Web.ApiSpec.Operations.id_path_param()],
    responses: %{204 => %OpenApiSpex.Response{description: "Cancelled"}}

  operation :process,
    summary: "Process payroll (calculate Rwanda PAYE for all employees)",
    description: "Dispatches payroll calculation as a background job. Calculates gross, PAYE tax, and net for every active employee using Rwanda tax brackets.",
    parameters: [SyncFlow.Web.ApiSpec.Operations.id_path_param("Payroll run UUID")],
    responses: %{
      202 => SyncFlow.Web.ApiSpec.Operations.json_response(202, "Processing enqueued", "PayrollRun"),
      422 => SyncFlow.Web.ApiSpec.Operations.json_response(422, "Error", "ErrorResponse")
    }

  operation :approve,
    summary: "Approve payroll run",
    parameters: [SyncFlow.Web.ApiSpec.Operations.id_path_param()],
    responses: %{200 => SyncFlow.Web.ApiSpec.Operations.json_response(200, "Approved", "PayrollRun")}

  operation :pay_slips,
    summary: "List pay slips for a payroll run",
    description: "Returns individual pay slips showing gross, PAYE deduction, and net for each employee.",
    parameters: [SyncFlow.Web.ApiSpec.Operations.id_path_param("Payroll run UUID")],
    responses: %{
      200 => SyncFlow.Web.ApiSpec.Operations.json_response(200, "Pay slips", "PaySlipList"),
      404 => SyncFlow.Web.ApiSpec.Operations.json_response(404, "Run not found", "ErrorResponse")
    }

  # --- Actions ---

  def index(conn, params) do
    runs =
      Queries.list_payroll_runs(conn.assigns.current_org_id,
        status: params["status"],
        page: parse_int(params["page"], 1)
      )

    json(conn, %{data: runs})
  end

  def show(conn, %{"id" => id}) do
    case Queries.get_payroll_run(id) do
      nil -> conn |> put_status(:not_found) |> json(%{error: "Payroll run not found"})
      run -> json(conn, %{data: run})
    end
  end

  def create(conn, params) do
    attrs = Map.put(params, "org_id", conn.assigns.current_org_id)

    case Queries.create_payroll_run(attrs) do
      {:ok, run} ->
        conn |> put_status(:created) |> json(%{data: run})

      {:error, cs} ->
        conn |> put_status(:unprocessable_entity) |> json(%{errors: format_errors(cs)})
    end
  end

  def update(conn, %{"id" => id} = params) do
    with run when not is_nil(run) <- Queries.get_payroll_run(id),
         {:ok, updated} <- Queries.update_payroll_run(run, params) do
      json(conn, %{data: updated})
    else
      nil -> conn |> put_status(:not_found) |> json(%{error: "Not found"})
      {:error, cs} -> conn |> put_status(:unprocessable_entity) |> json(%{errors: format_errors(cs)})
    end
  end

  def delete(conn, %{"id" => id}) do
    case Queries.get_payroll_run(id) do
      nil ->
        conn |> put_status(:not_found) |> json(%{error: "Not found"})

      run ->
        if run.status == :draft do
          {:ok, _} = Queries.update_payroll_run(run, %{status: :cancelled})
          conn |> put_status(:no_content) |> json(%{})
        else
          conn |> put_status(:conflict) |> json(%{error: "Cannot cancel a non-draft payroll run"})
        end
    end
  end

  def process(conn, %{"id" => id}) do
    user_id = conn.assigns.current_user.id

    case PayrollWorker.enqueue(id, user_id) do
      {:ok, _job} ->
        run = Queries.get_payroll_run!(id)
        conn |> put_status(:accepted) |> json(%{data: run, message: "Payroll processing enqueued"})

      {:error, reason} ->
        conn |> put_status(:unprocessable_entity) |> json(%{error: inspect(reason)})
    end
  end

  def approve(conn, %{"id" => id}) do
    case Queries.approve_payroll(id, conn.assigns.current_user.id) do
      {:ok, run} ->
        Phoenix.PubSub.broadcast(SyncFlow.PubSub, "org:#{run.org_id}:hr", {:payroll_approved, run})
        NotificationWorker.notify_payroll_ready(conn.assigns.current_user.id, to_string(run.period_start))
        json(conn, %{data: run, message: "Payroll approved"})

      {:error, reason} ->
        conn |> put_status(:unprocessable_entity) |> json(%{error: inspect(reason)})
    end
  end

  def pay_slips(conn, %{"id" => id}) do
    case Queries.get_payroll_run(id) do
      nil ->
        conn |> put_status(:not_found) |> json(%{error: "Payroll run not found"})

      run ->
        slips = Queries.list_pay_slips(id)
        json(conn, %{data: slips, run: run, count: length(slips)})
    end
  end

  defp parse_int(nil, d), do: d
  defp parse_int(v, _), do: String.to_integer(v)

  defp format_errors(cs) do
    Ecto.Changeset.traverse_errors(cs, fn {msg, opts} ->
      Enum.reduce(opts, msg, fn {k, v}, acc -> String.replace(acc, "%{#{k}}", to_string(v)) end)
    end)
  end
end
