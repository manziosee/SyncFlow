defmodule SyncFlow.CRM.Queries do
  import Ecto.Query
  alias SyncFlow.CRM.Repo
  alias SyncFlow.CRM.Schema.{Customer, Interaction}

  def list_customers(org_id, opts \\ []) do
    status = Keyword.get(opts, :status)
    type = Keyword.get(opts, :type)
    search = Keyword.get(opts, :search)
    page = Keyword.get(opts, :page, 1)
    per_page = Keyword.get(opts, :per_page, 20)

    Customer
    |> where([c], c.org_id == ^org_id)
    |> maybe_filter_status(status)
    |> maybe_filter_type(type)
    |> maybe_search(search)
    |> order_by([c], c.name)
    |> paginate(page, per_page)
    |> Repo.all()
  end

  def get_customer(id), do: Repo.get(Customer, id)
  def get_customer!(id), do: Repo.get!(Customer, id)

  def list_interactions(customer_id, opts \\ []) do
    limit = Keyword.get(opts, :limit, 20)

    Interaction
    |> where([i], i.customer_id == ^customer_id)
    |> order_by([i], desc: i.occurred_at)
    |> limit(^limit)
    |> Repo.all()
  end

  def customer_stats(org_id) do
    Customer
    |> where([c], c.org_id == ^org_id)
    |> group_by([c], c.status)
    |> select([c], {c.status, count(c.id)})
    |> Repo.all()
    |> Map.new()
  end

  defp maybe_filter_status(q, nil), do: q
  defp maybe_filter_status(q, s), do: where(q, [c], c.status == ^s)

  defp maybe_filter_type(q, nil), do: q
  defp maybe_filter_type(q, t), do: where(q, [c], c.type == ^t)

  defp maybe_search(q, nil), do: q
  defp maybe_search(q, term) do
    pattern = "%#{term}%"
    where(q, [c], ilike(c.name, ^pattern) or ilike(c.email, ^pattern) or ilike(c.phone, ^pattern))
  end

  defp paginate(q, page, per_page) do
    q |> limit(^per_page) |> offset(^((page - 1) * per_page))
  end
end
