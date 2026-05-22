defmodule SyncFlow.Core.Accounts.User do
  use Ecto.Schema
  @derive {Jason.Encoder, except: [:__meta__]}
  import Ecto.Changeset

  @roles ~w(superadmin admin manager accountant cashier warehouse_manager hr_manager
            procurement driver salesperson ceo auditor)a

  @primary_key {:id, :binary_id, autogenerate: true}
  @foreign_key_type :binary_id

  schema "users" do
    field :email, :string
    field :name, :string
    field :password_hash, :string
    field :password, :string, virtual: true
    field :role, Ecto.Enum, values: @roles, default: :cashier
    field :org_id, :binary_id
    field :permissions, {:array, :string}, default: []
    field :avatar_url, :string
    field :phone, :string
    field :department, :string
    field :is_active, :boolean, default: true
    field :last_seen_at, :utc_datetime
    field :timezone, :string, default: "Africa/Kigali"
    field :locale, :string, default: "en"

    belongs_to :organization, SyncFlow.Core.Accounts.Organization, define_field: false

    timestamps(type: :utc_datetime)
  end

  def changeset(user, attrs) do
    user
    |> cast(attrs, [:email, :name, :password, :role, :org_id, :phone, :department,
                    :avatar_url, :is_active, :timezone, :locale, :permissions])
    |> validate_required([:email, :name, :role, :org_id])
    |> validate_format(:email, ~r/^[^\s]+@[^\s]+\.[^\s]+$/)
    |> validate_length(:password, min: 8)
    |> unique_constraint(:email)
    |> hash_password()
  end

  def update_changeset(user, attrs) do
    user
    |> cast(attrs, [:name, :phone, :department, :avatar_url, :timezone, :locale, :permissions])
    |> validate_required([:name])
  end

  defp hash_password(%Ecto.Changeset{valid?: true, changes: %{password: pw}} = cs) do
    put_change(cs, :password_hash, Bcrypt.hash_pwd_salt(pw))
  end

  defp hash_password(cs), do: cs
end
