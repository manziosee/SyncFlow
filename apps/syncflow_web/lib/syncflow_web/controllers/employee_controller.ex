defmodule SyncFlow.Web.Controllers.EmployeeController do
  use Phoenix.Controller, formats: [:json]

  alias SyncFlow.HR.Queries

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
        conn
        |> put_status(:unprocessable_entity)
        |> json(%{errors: format_errors(cs)})
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

  defp parse_int(nil, d), do: d
  defp parse_int(v, _), do: String.to_integer(v)

  defp format_errors(cs) do
    Ecto.Changeset.traverse_errors(cs, fn {msg, opts} ->
      Enum.reduce(opts, msg, fn {k, v}, acc -> String.replace(acc, "%{#{k}}", to_string(v)) end)
    end)
  end
end
