defmodule SyncFlow.Web.Controllers.InvoiceController do
  use Phoenix.Controller, formats: [:json]
  use OpenApiSpex.ControllerSpecs

  alias OpenApiSpex.{Parameter, Schema}
  alias SyncFlow.Web.Dispatch, as: CommandedApp
  alias SyncFlow.Accounting.Commands
  alias SyncFlow.Accounting.Queries

  tags ["Invoices"]
  security [%{"bearerAuth" => []}]

  operation :index,
    summary: "List invoices",
    description: "Returns paginated invoices for the authenticated org. Filter by status or search by invoice number / customer name.",
    parameters: [
      %Parameter{name: :status, in: :query, schema: %Schema{type: :string, enum: ~w(draft pending_approval approved rejected voided paid)}},
      %Parameter{name: :search, in: :query, schema: %Schema{type: :string}},
      %Parameter{name: :page, in: :query, schema: %Schema{type: :integer, default: 1}},
      %Parameter{name: :per_page, in: :query, schema: %Schema{type: :integer, default: 20}}
    ],
    responses: %{
      200 => SyncFlow.Web.ApiSpec.Operations.json_response(200, "Paginated invoice list", "PaginatedResponse"),
      401 => SyncFlow.Web.ApiSpec.Operations.json_response(401, "Unauthorized", "ErrorResponse")
    }

  operation :show,
    summary: "Get invoice",
    parameters: [SyncFlow.Web.ApiSpec.Operations.id_path_param("Invoice UUID")],
    responses: %{
      200 => SyncFlow.Web.ApiSpec.Operations.json_response(200, "Invoice details", "Invoice"),
      404 => SyncFlow.Web.ApiSpec.Operations.json_response(404, "Not found", "ErrorResponse")
    }

  operation :create,
    summary: "Create invoice",
    request_body: SyncFlow.Web.ApiSpec.Operations.json_request_body("Invoice data", "CreateInvoiceRequest"),
    responses: %{
      201 => SyncFlow.Web.ApiSpec.Operations.json_response(201, "Invoice created", "Invoice"),
      422 => SyncFlow.Web.ApiSpec.Operations.json_response(422, "Validation error", "ErrorResponse")
    }

  operation :update,
    summary: "Update invoice metadata",
    parameters: [SyncFlow.Web.ApiSpec.Operations.id_path_param()],
    request_body: SyncFlow.Web.ApiSpec.Operations.json_request_body("Fields to update", "CreateInvoiceRequest", false),
    responses: %{
      200 => SyncFlow.Web.ApiSpec.Operations.json_response(200, "Updated invoice", "Invoice"),
      422 => SyncFlow.Web.ApiSpec.Operations.json_response(422, "Validation error", "ErrorResponse")
    }

  operation :delete,
    summary: "Void invoice (soft delete)",
    parameters: [SyncFlow.Web.ApiSpec.Operations.id_path_param()],
    responses: %{204 => %OpenApiSpex.Response{description: "Voided"}}

  operation :submit,
    summary: "Submit invoice for approval",
    parameters: [SyncFlow.Web.ApiSpec.Operations.id_path_param()],
    responses: %{
      200 => SyncFlow.Web.ApiSpec.Operations.json_response(200, "Submitted", "Invoice"),
      422 => SyncFlow.Web.ApiSpec.Operations.json_response(422, "Cannot submit", "ErrorResponse")
    }

  operation :approve,
    summary: "Approve invoice",
    parameters: [SyncFlow.Web.ApiSpec.Operations.id_path_param()],
    responses: %{200 => SyncFlow.Web.ApiSpec.Operations.json_response(200, "Approved", "Invoice")}

  operation :reject,
    summary: "Reject invoice",
    parameters: [SyncFlow.Web.ApiSpec.Operations.id_path_param()],
    request_body: SyncFlow.Web.ApiSpec.Operations.json_request_body("Rejection reason", "RejectInvoiceRequest", false),
    responses: %{200 => SyncFlow.Web.ApiSpec.Operations.json_response(200, "Rejected", "Invoice")}

  operation :void,
    summary: "Void invoice",
    parameters: [SyncFlow.Web.ApiSpec.Operations.id_path_param()],
    responses: %{200 => SyncFlow.Web.ApiSpec.Operations.json_response(200, "Voided", "Invoice")}

  operation :stats,
    summary: "Invoice KPIs by status",
    description: "Count and total amount grouped by status (draft, approved, paid, etc.)",
    responses: %{200 => SyncFlow.Web.ApiSpec.Operations.json_response(200, "Invoice statistics", "InvoiceStats")}

  operation :overdue,
    summary: "Overdue invoices",
    description: "Approved invoices past their due date.",
    responses: %{200 => SyncFlow.Web.ApiSpec.Operations.json_response(200, "Overdue invoices", "PaginatedResponse")}

  operation :revenue_by_month,
    summary: "Monthly revenue breakdown",
    parameters: [%Parameter{name: :year, in: :query, schema: %Schema{type: :integer, example: 2024}}],
    responses: %{200 => SyncFlow.Web.ApiSpec.Operations.json_response(200, "Revenue by month", "RevenueByMonth")}

  # --- Actions ---

  def index(conn, params) do
    invoices =
      Queries.list_invoices(conn.assigns.current_org_id,
        status: params["status"],
        page: parse_int(params["page"], 1),
        per_page: parse_int(params["per_page"], 20),
        search: params["search"]
      )

    json(conn, %{data: invoices})
  end

  def show(conn, %{"id" => id}) do
    case Queries.get_invoice(id) do
      nil -> conn |> put_status(:not_found) |> json(%{error: "Not found"})
      invoice -> json(conn, %{data: invoice})
    end
  end

  def create(conn, params) do
    cmd = %Commands.CreateInvoice{
      invoice_id: UUID.uuid4(),
      org_id: conn.assigns.current_org_id,
      customer_id: params["customer_id"] || UUID.uuid4(),
      customer_name: params["customer_name"],
      customer_email: params["customer_email"],
      currency: params["currency"] || "RWF",
      due_date: params["due_date"],
      lines: params["lines"] || [],
      notes: params["notes"],
      created_by: conn.assigns.current_user.id
    }

    case CommandedApp.dispatch(cmd, returning: true) do
      {:ok, _} ->
        conn |> put_status(:created) |> json(%{data: %{invoice_id: cmd.invoice_id}})

      {:error, reason} ->
        conn |> put_status(:unprocessable_entity) |> json(%{error: to_string(reason)})
    end
  end

  def update(conn, %{"id" => _id} = params) do
    fields = Map.take(params, ~w(customer_name due_date notes currency))

    Enum.reduce_while(fields, :ok, fn {field, value}, _ ->
      cmd = %Commands.UpdateInvoiceField{
        invoice_id: params["id"],
        field: field,
        value: value,
        updated_by: conn.assigns.current_user.id
      }

      case CommandedApp.dispatch(cmd) do
        :ok -> {:cont, :ok}
        {:error, reason} -> {:halt, {:error, reason}}
      end
    end)
    |> case do
      :ok -> json(conn, %{data: %{status: "updated"}})
      {:error, reason} -> conn |> put_status(:unprocessable_entity) |> json(%{error: to_string(reason)})
    end
  end

  def delete(conn, %{"id" => id}) do
    cmd = %Commands.VoidInvoice{
      invoice_id: id,
      voided_by: conn.assigns.current_user.id,
      reason: "deleted via API"
    }

    case CommandedApp.dispatch(cmd) do
      :ok -> conn |> put_status(:no_content) |> json(%{})
      {:error, reason} -> conn |> put_status(:unprocessable_entity) |> json(%{error: to_string(reason)})
    end
  end

  def submit(conn, %{"id" => id}) do
    dispatch_and_respond(conn, %Commands.SubmitInvoiceForApproval{
      invoice_id: id,
      submitted_by: conn.assigns.current_user.id
    })
  end

  def approve(conn, %{"id" => id} = params) do
    dispatch_and_respond(conn, %Commands.ApproveInvoice{
      invoice_id: id,
      approved_by: conn.assigns.current_user.id,
      notes: params["notes"]
    })
  end

  def reject(conn, %{"id" => id} = params) do
    dispatch_and_respond(conn, %Commands.RejectInvoice{
      invoice_id: id,
      rejected_by: conn.assigns.current_user.id,
      reason: params["reason"]
    })
  end

  def void(conn, %{"id" => id} = params) do
    dispatch_and_respond(conn, %Commands.VoidInvoice{
      invoice_id: id,
      voided_by: conn.assigns.current_user.id,
      reason: params["reason"]
    })
  end

  def stats(conn, _params) do
    json(conn, %{data: Queries.invoice_stats(conn.assigns.current_org_id)})
  end

  def overdue(conn, _params) do
    invoices = Queries.overdue_invoices(conn.assigns.current_org_id)
    json(conn, %{data: invoices, count: length(invoices)})
  end

  def revenue_by_month(conn, params) do
    year = parse_int(params["year"], Date.utc_today().year)
    data = Queries.revenue_by_month(conn.assigns.current_org_id, year)

    rows =
      Enum.map(data, fn {month, total} ->
        %{month: trunc(month), total: total}
      end)

    json(conn, %{data: rows, year: year})
  end

  defp dispatch_and_respond(conn, cmd) do
    case CommandedApp.dispatch(cmd) do
      :ok -> json(conn, %{data: %{status: "ok"}})
      {:error, reason} -> conn |> put_status(:unprocessable_entity) |> json(%{error: to_string(reason)})
    end
  end

  defp parse_int(nil, default), do: default
  defp parse_int(v, _), do: String.to_integer(v)
end
