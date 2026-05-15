defmodule SyncFlow.Web.Controllers.OrganizationController do
  use Phoenix.Controller, formats: [:json]

  alias SyncFlow.Core.Accounts

  def index(conn, _params) do
    # Superadmin only: list all orgs
    case Accounts.get_organization(conn.assigns.current_org_id) do
      nil -> conn |> put_status(:not_found) |> json(%{error: "Not found"})
      org -> json(conn, %{data: [org]})
    end
  end

  def show(conn, %{"id" => id}) do
    case Accounts.get_organization(id) do
      nil -> conn |> put_status(:not_found) |> json(%{error: "Organization not found"})
      org -> json(conn, %{data: org})
    end
  end

  def create(conn, params) do
    case Accounts.create_organization(params) do
      {:ok, org} ->
        conn |> put_status(:created) |> json(%{data: org})

      {:error, cs} ->
        conn
        |> put_status(:unprocessable_entity)
        |> json(%{errors: format_errors(cs)})
    end
  end

  def update(conn, %{"id" => id} = params) do
    with org when not is_nil(org) <- Accounts.get_organization(id) do
      changeset = SyncFlow.Core.Accounts.Organization.changeset(org, params)

      case SyncFlow.Core.Repo.update(changeset) do
        {:ok, updated} -> json(conn, %{data: updated})
        {:error, cs} -> conn |> put_status(:unprocessable_entity) |> json(%{errors: format_errors(cs)})
      end
    else
      nil -> conn |> put_status(:not_found) |> json(%{error: "Not found"})
    end
  end

  def delete(conn, %{"id" => id}) do
    case Accounts.get_organization(id) do
      nil ->
        conn |> put_status(:not_found) |> json(%{error: "Not found"})

      org ->
        SyncFlow.Core.Repo.update!(Ecto.Changeset.change(org, is_active: false))
        conn |> put_status(:no_content) |> json(%{})
    end
  end

  defp format_errors(cs) do
    Ecto.Changeset.traverse_errors(cs, fn {msg, opts} ->
      Enum.reduce(opts, msg, fn {k, v}, acc -> String.replace(acc, "%{#{k}}", to_string(v)) end)
    end)
  end
end
