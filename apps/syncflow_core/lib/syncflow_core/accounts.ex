defmodule SyncFlow.Core.Accounts do
  import Ecto.Query
  alias SyncFlow.Core.Repo
  alias SyncFlow.Core.Accounts.{User, Organization}
  alias SyncFlow.Core.Auth.Guardian

  # --- Users ---

  def get_user(id), do: Repo.get(User, id)
  def get_user!(id), do: Repo.get!(User, id)

  def get_user_by_email(email) do
    Repo.get_by(User, email: String.downcase(email))
  end

  def list_users(org_id) do
    User
    |> where([u], u.org_id == ^org_id and u.is_active == true)
    |> order_by([u], u.name)
    |> Repo.all()
  end

  def create_user(attrs) do
    %User{}
    |> User.changeset(attrs)
    |> Repo.insert()
  end

  def update_user(%User{} = user, attrs) do
    user
    |> User.update_changeset(attrs)
    |> Repo.update()
  end

  def authenticate(email, password) do
    user = get_user_by_email(email)

    cond do
      is_nil(user) ->
        Bcrypt.no_user_verify()
        {:error, :not_found}

      not user.is_active ->
        {:error, :inactive}

      Bcrypt.verify_pass(password, user.password_hash) ->
        {:ok, user}

      true ->
        {:error, :invalid_credentials}
    end
  end

  def generate_tokens(user) do
    with {:ok, access_token, _claims} <-
           Guardian.encode_and_sign(user, %{}, token_type: "access", ttl: {24, :hour}),
         {:ok, refresh_token, _claims} <-
           Guardian.encode_and_sign(user, %{}, token_type: "refresh", ttl: {30, :day}) do
      {:ok, %{access_token: access_token, refresh_token: refresh_token}}
    end
  end

  def touch_last_seen(%User{} = user) do
    user
    |> Ecto.Changeset.change(last_seen_at: DateTime.utc_now() |> DateTime.truncate(:second))
    |> Repo.update()
  end

  # --- Organizations ---

  def get_organization(id), do: Repo.get(Organization, id)

  def create_organization(attrs) do
    %Organization{}
    |> Organization.changeset(attrs)
    |> Repo.insert()
  end
end
