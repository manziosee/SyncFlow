defmodule SyncFlow.Web.Controllers.StockItemController do
  use Phoenix.Controller, formats: [:json]

  alias SyncFlow.Core.CommandedApp
  alias SyncFlow.Inventory.{Commands, Queries}

  def index(conn, params) do
    items =
      Queries.list_stock_items(conn.assigns.current_org_id,
        warehouse_id: params["warehouse_id"],
        category: params["category"],
        search: params["search"],
        page: parse_int(params["page"], 1),
        per_page: parse_int(params["per_page"], 50)
      )

    json(conn, %{data: items})
  end

  def show(conn, %{"id" => id}) do
    case Queries.get_stock_item(id) do
      nil -> conn |> put_status(:not_found) |> json(%{error: "Not found"})
      item -> json(conn, %{data: item})
    end
  end

  def create(conn, params) do
    cmd = %Commands.CreateStockItem{
      item_id: UUID.uuid4(),
      org_id: conn.assigns.current_org_id,
      warehouse_id: params["warehouse_id"],
      sku: params["sku"],
      name: params["name"],
      category: params["category"],
      unit: params["unit"] || "pcs",
      quantity: params["quantity"] || 0,
      reorder_point: params["reorder_point"] || 0,
      reorder_quantity: params["reorder_quantity"] || 0,
      unit_cost: params["unit_cost"],
      currency: params["currency"] || "RWF",
      created_by: conn.assigns.current_user.id
    }

    case CommandedApp.dispatch(cmd) do
      :ok ->
        conn |> put_status(:created) |> json(%{data: %{item_id: cmd.item_id}})

      {:error, reason} ->
        conn |> put_status(:unprocessable_entity) |> json(%{error: to_string(reason)})
    end
  end

  def update(conn, %{"id" => id} = params) do
    # Stock item metadata updates go through Ecto directly (not CQRS)
    # Quantity changes must use adjust/transfer
    item = Queries.get_stock_item!(id)

    changes =
      Map.take(params, ["name", "category", "unit", "reorder_point",
                        "reorder_quantity", "unit_cost", "sku"])

    case SyncFlow.Inventory.Repo.update(Ecto.Changeset.change(item, atomize(changes))) do
      {:ok, updated} -> json(conn, %{data: updated})
      {:error, cs} -> conn |> put_status(:unprocessable_entity) |> json(%{errors: cs})
    end
  end

  def delete(conn, %{"id" => id}) do
    item = Queries.get_stock_item!(id)
    SyncFlow.Inventory.Repo.update!(Ecto.Changeset.change(item, is_active: false))
    conn |> put_status(:no_content) |> json(%{})
  end

  def adjust(conn, %{"id" => id} = params) do
    cmd = %Commands.AdjustStock{
      item_id: id,
      warehouse_id: Queries.get_stock_item!(id).warehouse_id,
      quantity_delta: params["quantity_delta"],
      reason: params["reason"] || "manual_adjustment",
      adjusted_by: conn.assigns.current_user.id,
      reference_id: params["reference_id"]
    }

    case CommandedApp.dispatch(cmd) do
      :ok -> json(conn, %{data: %{status: "adjusted"}})
      {:error, reason} -> conn |> put_status(:unprocessable_entity) |> json(%{error: to_string(reason)})
    end
  end

  def transfer(conn, %{"id" => id} = params) do
    cmd = %Commands.TransferStock{
      item_id: id,
      from_warehouse_id: params["from_warehouse_id"],
      to_warehouse_id: params["to_warehouse_id"],
      quantity: params["quantity"],
      initiated_by: conn.assigns.current_user.id,
      notes: params["notes"]
    }

    case CommandedApp.dispatch(cmd) do
      :ok -> json(conn, %{data: %{status: "transfer_initiated"}})
      {:error, reason} -> conn |> put_status(:unprocessable_entity) |> json(%{error: to_string(reason)})
    end
  end

  def low_stock(conn, params) do
    items = Queries.low_stock_items(conn.assigns.current_org_id, params["warehouse_id"])
    json(conn, %{data: items, count: length(items)})
  end

  defp parse_int(nil, default), do: default
  defp parse_int(val, _), do: String.to_integer(val)

  defp atomize(map) do
    Map.new(map, fn {k, v} -> {String.to_existing_atom(k), v} end)
  end
end
