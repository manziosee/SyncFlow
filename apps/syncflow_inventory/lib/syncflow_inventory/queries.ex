defmodule SyncFlow.Inventory.Queries do
  import Ecto.Query
  alias SyncFlow.Inventory.Repo
  alias SyncFlow.Inventory.Schema.{StockItem, StockMovement, StockTransfer, Warehouse}

  # --- Warehouses ---

  def list_warehouses(org_id) do
    Warehouse
    |> where([w], w.org_id == ^org_id and w.is_active == true)
    |> order_by([w], w.name)
    |> Repo.all()
  end

  def get_warehouse(id), do: Repo.get(Warehouse, id)
  def get_warehouse!(id), do: Repo.get!(Warehouse, id)

  def create_warehouse(attrs) do
    %Warehouse{}
    |> Warehouse.changeset(attrs)
    |> Repo.insert()
  end

  def update_warehouse(%Warehouse{} = w, attrs) do
    w |> Warehouse.changeset(attrs) |> Repo.update()
  end

  # --- Stock Items ---

  def list_stock_items(org_id, opts \\ []) do
    warehouse_id = Keyword.get(opts, :warehouse_id)
    low_stock = Keyword.get(opts, :low_stock)
    category = Keyword.get(opts, :category)
    search = Keyword.get(opts, :search)
    page = Keyword.get(opts, :page, 1)
    per_page = Keyword.get(opts, :per_page, 50)

    StockItem
    |> where([s], s.org_id == ^org_id and s.is_active == true)
    |> maybe_filter_warehouse(warehouse_id)
    |> maybe_filter_low_stock(low_stock)
    |> maybe_filter_category(category)
    |> maybe_search_items(search)
    |> order_by([s], s.name)
    |> paginate(page, per_page)
    |> Repo.all()
  end

  def get_stock_item(id), do: Repo.get(StockItem, id)
  def get_stock_item!(id), do: Repo.get!(StockItem, id)

  def low_stock_items(org_id, warehouse_id \\ nil) do
    StockItem
    |> where([s], s.org_id == ^org_id and s.is_low_stock == true)
    |> maybe_filter_warehouse(warehouse_id)
    |> order_by([s], s.quantity)
    |> Repo.all()
  end

  def stock_item_movements(item_id, opts \\ []) do
    limit = Keyword.get(opts, :limit, 50)

    StockMovement
    |> where([m], m.item_id == ^item_id)
    |> order_by([m], desc: m.occurred_at)
    |> limit(^limit)
    |> Repo.all()
  end

  # --- Transfers ---

  def list_transfers(opts \\ []) do
    status = Keyword.get(opts, :status)
    warehouse_id = Keyword.get(opts, :warehouse_id)
    page = Keyword.get(opts, :page, 1)
    per_page = Keyword.get(opts, :per_page, 20)

    StockTransfer
    |> maybe_filter_transfer_status(status)
    |> maybe_filter_transfer_warehouse(warehouse_id)
    |> order_by([t], desc: t.initiated_at)
    |> paginate(page, per_page)
    |> Repo.all()
  end

  def inventory_value(org_id) do
    StockItem
    |> where([s], s.org_id == ^org_id and s.is_active == true and not is_nil(s.unit_cost))
    |> select([s], %{
      total_items: count(s.id),
      total_value: sum(fragment("? * ?", s.quantity, s.unit_cost))
    })
    |> Repo.one()
  end

  # --- Private filters ---

  defp maybe_filter_warehouse(q, nil), do: q
  defp maybe_filter_warehouse(q, id), do: where(q, [s], s.warehouse_id == ^id)

  defp maybe_filter_low_stock(q, true), do: where(q, [s], s.is_low_stock == true)
  defp maybe_filter_low_stock(q, _), do: q

  defp maybe_filter_category(q, nil), do: q
  defp maybe_filter_category(q, cat), do: where(q, [s], s.category == ^cat)

  defp maybe_search_items(q, nil), do: q
  defp maybe_search_items(q, term) do
    pattern = "%#{term}%"
    where(q, [s], ilike(s.name, ^pattern) or ilike(s.sku, ^pattern))
  end

  defp maybe_filter_transfer_status(q, nil), do: q
  defp maybe_filter_transfer_status(q, s), do: where(q, [t], t.status == ^s)

  defp maybe_filter_transfer_warehouse(q, nil), do: q
  defp maybe_filter_transfer_warehouse(q, id) do
    where(q, [t], t.from_warehouse_id == ^id or t.to_warehouse_id == ^id)
  end

  defp paginate(q, page, per_page) do
    q |> limit(^per_page) |> offset(^((page - 1) * per_page))
  end
end
