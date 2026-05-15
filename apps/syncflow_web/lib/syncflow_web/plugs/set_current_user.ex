defmodule SyncFlow.Web.Plugs.SetCurrentUser do
  import Plug.Conn

  def init(opts), do: opts

  def call(conn, _opts) do
    user = Guardian.Plug.current_resource(conn)

    conn
    |> assign(:current_user, user)
    |> assign(:current_org_id, user && user.org_id)
  end
end

defmodule SyncFlow.Web.Plugs.RequireRole do
  import Plug.Conn
  import Phoenix.Controller

  def init(opts), do: opts

  def call(conn, roles: allowed_roles) do
    user = conn.assigns[:current_user]

    if user && user.role in allowed_roles do
      conn
    else
      conn
      |> put_status(:forbidden)
      |> json(%{error: "Insufficient permissions"})
      |> halt()
    end
  end
end
