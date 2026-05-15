defmodule SyncFlow.Web.Controllers.WarehouseController do
  use Phoenix.Controller, formats: [:json]

  alias SyncFlow.Inventory.Queries

  def index(conn, _params) do
    warehouses = Queries.list_warehouses(conn.assigns.current_org_id)
    json(conn, %{data: warehouses})
  end

  def show(conn, %{"id" => id}) do
    case Queries.get_warehouse(id) do
      nil -> conn |> put_status(:not_found) |> json(%{error: "Warehouse not found"})
      wh -> json(conn, %{data: wh})
    end
  end

  def create(conn, params) do
    attrs = Map.put(params, "org_id", conn.assigns.current_org_id)

    case Queries.create_warehouse(attrs) do
      {:ok, wh} ->
        conn |> put_status(:created) |> json(%{data: wh})

      {:error, cs} ->
        conn |> put_status(:unprocessable_entity) |> json(%{errors: format_errors(cs)})
    end
  end

  def update(conn, %{"id" => id} = params) do
    with wh when not is_nil(wh) <- Queries.get_warehouse(id),
         {:ok, updated} <- Queries.update_warehouse(wh, params) do
      json(conn, %{data: updated})
    else
      nil -> conn |> put_status(:not_found) |> json(%{error: "Not found"})
      {:error, cs} -> conn |> put_status(:unprocessable_entity) |> json(%{errors: format_errors(cs)})
    end
  end

  def delete(conn, %{"id" => id}) do
    case Queries.get_warehouse(id) do
      nil ->
        conn |> put_status(:not_found) |> json(%{error: "Not found"})

      wh ->
        {:ok, _} = Queries.update_warehouse(wh, %{is_active: false})
        conn |> put_status(:no_content) |> json(%{})
    end
  end

  defp format_errors(cs) do
    Ecto.Changeset.traverse_errors(cs, fn {msg, opts} ->
      Enum.reduce(opts, msg, fn {k, v}, acc -> String.replace(acc, "%{#{k}}", to_string(v)) end)
    end)
  end
end
