defmodule SyncFlow.Web.Controllers.UserController do
  use Phoenix.Controller, formats: [:json]

  alias SyncFlow.Core.Accounts

  def index(conn, _params) do
    users = Accounts.list_users(conn.assigns.current_org_id)
    json(conn, %{data: Enum.map(users, &format_user/1)})
  end

  def show(conn, %{"id" => id}) do
    case Accounts.get_user(id) do
      nil -> conn |> put_status(:not_found) |> json(%{error: "User not found"})
      user -> json(conn, %{data: format_user(user)})
    end
  end

  def create(conn, params) do
    attrs = Map.put(params, "org_id", conn.assigns.current_org_id)

    case Accounts.create_user(attrs) do
      {:ok, user} ->
        conn |> put_status(:created) |> json(%{data: format_user(user)})

      {:error, cs} ->
        conn
        |> put_status(:unprocessable_entity)
        |> json(%{errors: format_errors(cs)})
    end
  end

  def update(conn, %{"id" => id} = params) do
    with user when not is_nil(user) <- Accounts.get_user(id),
         {:ok, updated} <- Accounts.update_user(user, params) do
      json(conn, %{data: format_user(updated)})
    else
      nil -> conn |> put_status(:not_found) |> json(%{error: "Not found"})
      {:error, cs} -> conn |> put_status(:unprocessable_entity) |> json(%{errors: format_errors(cs)})
    end
  end

  def delete(conn, %{"id" => id}) do
    case Accounts.get_user(id) do
      nil ->
        conn |> put_status(:not_found) |> json(%{error: "Not found"})

      user ->
        Accounts.update_user(user, %{"is_active" => false})
        conn |> put_status(:no_content) |> json(%{})
    end
  end

  defp format_user(u) do
    %{id: u.id, name: u.name, email: u.email, role: u.role,
      phone: u.phone, department: u.department, is_active: u.is_active,
      last_seen_at: u.last_seen_at, inserted_at: u.inserted_at}
  end

  defp format_errors(cs) do
    Ecto.Changeset.traverse_errors(cs, fn {msg, opts} ->
      Enum.reduce(opts, msg, fn {k, v}, acc -> String.replace(acc, "%{#{k}}", to_string(v)) end)
    end)
  end
end
