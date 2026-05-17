defmodule SyncFlow.Web.Controllers.ReportController do
  use Phoenix.Controller, formats: [:json]
  use OpenApiSpex.ControllerSpecs

  alias SyncFlow.Core.Workers.ReportWorker

  tags ["Reports"]
  security [%{"bearerAuth" => []}]

  operation :generate,
    summary: "Enqueue report generation",
    description: """
    Dispatches a report generation job to the background queue.
    When complete, the result is pushed to the requesting user's notification channel.

    **Report types:**
    - `monthly_revenue` — Revenue by month (requires `year` param)
    - `inventory_audit` — Full inventory value snapshot + low stock list
    - `payroll_summary` — Payroll totals and headcount by department
    - `fleet_utilization` — Trip distances and fuel costs per vehicle
    - `overdue_invoices` — All invoices past due date with totals
    """,
    request_body: SyncFlow.Web.ApiSpec.Operations.json_request_body("Report request", "GenerateReportRequest"),
    responses: %{
      202 => SyncFlow.Web.ApiSpec.Operations.json_response(202, "Report enqueued", "ReportEnqueuedResponse"),
      422 => SyncFlow.Web.ApiSpec.Operations.json_response(422, "Unknown report type", "ErrorResponse")
    }

  @valid_types ~w(monthly_revenue inventory_audit payroll_summary fleet_utilization overdue_invoices)

  def generate(conn, %{"type" => type} = params) do
    if type not in @valid_types do
      conn
      |> put_status(:unprocessable_entity)
      |> json(%{error: "Unknown report type. Valid: #{Enum.join(@valid_types, ", ")}"})
    else
      extra = Map.take(params, ["year"])
      org_id = conn.assigns.current_org_id
      user_id = conn.assigns.current_user.id

      case ReportWorker.enqueue(type, org_id, user_id, extra) do
        {:ok, job} ->
          conn
          |> put_status(:accepted)
          |> json(%{
            data: %{job_id: job.id, type: type, status: "queued"},
            message: "Report queued. You will receive a notification when it is ready."
          })

        {:error, reason} ->
          conn
          |> put_status(:unprocessable_entity)
          |> json(%{error: inspect(reason)})
      end
    end
  end
end
