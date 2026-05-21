defmodule SyncFlow.Core.Repo do
  use Ecto.Repo,
    otp_app: :syncflow_core,
    adapter: Ecto.Adapters.Postgres

  import Ecto.Query

  def paginate(query, page, per_page \\ 20) do
    offset_val = (page - 1) * per_page

    query
    |> limit(^per_page)
    |> offset(^offset_val)
    |> all()
  end
end
