defmodule SyncFlow.Core.Repo do
  use Ecto.Repo,
    otp_app: :syncflow_core,
    adapter: Ecto.Adapters.Postgres

  def paginate(query, page, per_page \\ 20) do
    offset = (page - 1) * per_page

    query
    |> limit(^per_page)
    |> offset(^offset)
    |> all()
  end
end
