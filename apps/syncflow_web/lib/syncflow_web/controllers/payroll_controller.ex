defmodule SyncFlow.Web.Controllers.PayrollController do
  use Phoenix.Controller, formats: [:json]

  alias SyncFlow.HR.Queries

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
        conn
        |> put_status(:unprocessable_entity)
        |> json(%{errors: format_errors(cs)})
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
          conn |> put_status(:conflict) |> json(%{error: "Cannot delete a non-draft payroll run"})
        end
    end
  end

  def process(conn, %{"id" => id}) do
    case Queries.process_payroll(id, conn.assigns.current_user.id) do
      {:ok, run} ->
        # Notify via PubSub so dashboards update live
        Phoenix.PubSub.broadcast(SyncFlow.PubSub, "org:#{run.org_id}:hr", {:payroll_processed, run})
        json(conn, %{data: run, message: "Payroll processed successfully"})

      {:error, reason} ->
        conn |> put_status(:unprocessable_entity) |> json(%{error: inspect(reason)})
    end
  end

  def approve(conn, %{"id" => id}) do
    case Queries.approve_payroll(id, conn.assigns.current_user.id) do
      {:ok, run} ->
        Phoenix.PubSub.broadcast(SyncFlow.PubSub, "org:#{run.org_id}:hr", {:payroll_approved, run})
        json(conn, %{data: run, message: "Payroll approved"})

      {:error, reason} ->
        conn |> put_status(:unprocessable_entity) |> json(%{error: inspect(reason)})
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
