defmodule SyncFlow.Web.Controllers.AuthController do
  use Phoenix.Controller, formats: [:json]

  alias SyncFlow.Core.Accounts
  alias SyncFlow.Core.Auth.Guardian

  def login(conn, %{"email" => email, "password" => password}) do
    case Accounts.authenticate(email, password) do
      {:ok, user} ->
        {:ok, tokens} = Accounts.generate_tokens(user)

        conn
        |> put_status(:ok)
        |> json(%{
          data: %{
            user: format_user(user),
            access_token: tokens.access_token,
            refresh_token: tokens.refresh_token
          }
        })

      {:error, :not_found} ->
        conn |> put_status(:unauthorized) |> json(%{error: "Invalid credentials"})

      {:error, :inactive} ->
        conn |> put_status(:forbidden) |> json(%{error: "Account is deactivated"})

      {:error, _} ->
        conn |> put_status(:unauthorized) |> json(%{error: "Invalid credentials"})
    end
  end

  def register(conn, params) do
    with {:ok, org} <- Accounts.create_organization(%{name: params["org_name"]}),
         {:ok, user} <- Accounts.create_user(Map.put(params, "org_id", org.id)) do
      {:ok, tokens} = Accounts.generate_tokens(user)

      conn
      |> put_status(:created)
      |> json(%{
        data: %{
          user: format_user(user),
          organization: %{id: org.id, name: org.name},
          access_token: tokens.access_token,
          refresh_token: tokens.refresh_token
        }
      })
    else
      {:error, changeset} ->
        conn
        |> put_status(:unprocessable_entity)
        |> json(%{errors: format_errors(changeset)})
    end
  end

  def refresh(conn, %{"refresh_token" => token}) do
    case Guardian.decode_and_verify(token, %{"typ" => "refresh"}) do
      {:ok, claims} ->
        with {:ok, user} <- Guardian.resource_from_claims(claims),
             {:ok, tokens} <- Accounts.generate_tokens(user) do
          conn |> json(%{data: tokens})
        end

      _ ->
        conn |> put_status(:unauthorized) |> json(%{error: "Invalid refresh token"})
    end
  end

  defp format_user(user) do
    %{
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      org_id: user.org_id,
      avatar_url: user.avatar_url
    }
  end

  defp format_errors(%Ecto.Changeset{} = cs) do
    Ecto.Changeset.traverse_errors(cs, fn {msg, opts} ->
      Enum.reduce(opts, msg, fn {k, v}, acc ->
        String.replace(acc, "%{#{k}}", to_string(v))
      end)
    end)
  end
end
