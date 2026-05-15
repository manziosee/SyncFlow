defmodule SyncFlow.Web.Controllers.InvoiceController do
  use Phoenix.Controller, formats: [:json]

  alias SyncFlow.Core.CommandedApp
  alias SyncFlow.Accounting.Commands
  alias SyncFlow.Accounting.Queries

  def index(conn, params) do
    invoices =
      Queries.list_invoices(conn.assigns.current_org_id,
        status: params["status"],
        page: String.to_integer(params["page"] || "1"),
        per_page: String.to_integer(params["per_page"] || "20"),
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
      customer_id: params["customer_id"],
      customer_name: params["customer_name"],
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

  def submit(conn, %{"id" => id}) do
    cmd = %Commands.SubmitInvoiceForApproval{
      invoice_id: id,
      submitted_by: conn.assigns.current_user.id
    }

    dispatch_and_respond(conn, cmd)
  end

  def approve(conn, %{"id" => id} = params) do
    cmd = %Commands.ApproveInvoice{
      invoice_id: id,
      approved_by: conn.assigns.current_user.id,
      notes: params["notes"]
    }

    dispatch_and_respond(conn, cmd)
  end

  def reject(conn, %{"id" => id} = params) do
    cmd = %Commands.RejectInvoice{
      invoice_id: id,
      rejected_by: conn.assigns.current_user.id,
      reason: params["reason"]
    }

    dispatch_and_respond(conn, cmd)
  end

  def void(conn, %{"id" => id} = params) do
    cmd = %Commands.VoidInvoice{
      invoice_id: id,
      voided_by: conn.assigns.current_user.id,
      reason: params["reason"]
    }

    dispatch_and_respond(conn, cmd)
  end

  def stats(conn, _params) do
    stats = Queries.invoice_stats(conn.assigns.current_org_id)
    json(conn, %{data: stats})
  end

  def overdue(conn, _params) do
    invoices = Queries.overdue_invoices(conn.assigns.current_org_id)
    json(conn, %{data: invoices})
  end

  def revenue_by_month(conn, params) do
    year = String.to_integer(params["year"] || to_string(Date.utc_today().year))
    data = Queries.revenue_by_month(conn.assigns.current_org_id, year)
    json(conn, %{data: data})
  end

  defp dispatch_and_respond(conn, cmd) do
    case CommandedApp.dispatch(cmd) do
      :ok -> json(conn, %{data: %{status: "ok"}})
      {:error, reason} -> conn |> put_status(:unprocessable_entity) |> json(%{error: to_string(reason)})
    end
  end
end
