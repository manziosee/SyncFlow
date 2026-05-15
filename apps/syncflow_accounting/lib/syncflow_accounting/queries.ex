defmodule SyncFlow.Accounting.Queries do
  import Ecto.Query
  alias SyncFlow.Accounting.Repo
  alias SyncFlow.Accounting.Schema.Invoice

  def list_invoices(org_id, opts \\ []) do
    status = Keyword.get(opts, :status)
    page = Keyword.get(opts, :page, 1)
    per_page = Keyword.get(opts, :per_page, 20)
    customer_id = Keyword.get(opts, :customer_id)
    search = Keyword.get(opts, :search)

    Invoice
    |> where([i], i.org_id == ^org_id)
    |> maybe_filter_status(status)
    |> maybe_filter_customer(customer_id)
    |> maybe_search(search)
    |> order_by([i], desc: i.inserted_at)
    |> paginate(page, per_page)
    |> Repo.all()
  end

  def get_invoice(id), do: Repo.get(Invoice, id)
  def get_invoice!(id), do: Repo.get!(Invoice, id)

  def invoice_stats(org_id) do
    Invoice
    |> where([i], i.org_id == ^org_id)
    |> group_by([i], i.status)
    |> select([i], {i.status, count(i.id), sum(i.total_amount)})
    |> Repo.all()
    |> Enum.into(%{}, fn {status, count, total} ->
      {status, %{count: count, total: total || Decimal.new("0")}}
    end)
  end

  def overdue_invoices(org_id) do
    today = Date.utc_today()

    Invoice
    |> where([i], i.org_id == ^org_id and i.status in [:approved] and i.due_date < ^today)
    |> order_by([i], i.due_date)
    |> Repo.all()
  end

  def revenue_by_month(org_id, year) do
    Invoice
    |> where([i], i.org_id == ^org_id and i.status == :approved)
    |> where([i], fragment("EXTRACT(YEAR FROM ?)", i.inserted_at) == ^year)
    |> group_by([i], fragment("EXTRACT(MONTH FROM ?)", i.inserted_at))
    |> select([i], {
      fragment("EXTRACT(MONTH FROM ?)", i.inserted_at),
      sum(i.total_amount)
    })
    |> Repo.all()
  end

  defp maybe_filter_status(q, nil), do: q
  defp maybe_filter_status(q, status), do: where(q, [i], i.status == ^status)

  defp maybe_filter_customer(q, nil), do: q
  defp maybe_filter_customer(q, id), do: where(q, [i], i.customer_id == ^id)

  defp maybe_search(q, nil), do: q
  defp maybe_search(q, term) do
    pattern = "%#{term}%"
    where(q, [i], ilike(i.invoice_number, ^pattern) or ilike(i.customer_name, ^pattern))
  end

  defp paginate(q, page, per_page) do
    q
    |> limit(^per_page)
    |> offset(^((page - 1) * per_page))
  end
end
