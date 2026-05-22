defmodule SyncFlow.Core.Accounts.Organization do
  use Ecto.Schema
  @derive {Jason.Encoder, except: [:__meta__]}
  import Ecto.Changeset

  @primary_key {:id, :binary_id, autogenerate: true}

  schema "organizations" do
    field :name, :string
    field :slug, :string
    field :country, :string, default: "RW"
    field :currency, :string, default: "RWF"
    field :timezone, :string, default: "Africa/Kigali"
    field :tax_id, :string
    field :address, :map
    field :logo_url, :string
    field :settings, :map, default: %{}
    field :plan, Ecto.Enum, values: [:free, :starter, :professional, :enterprise], default: :free
    field :is_active, :boolean, default: true

    has_many :users, SyncFlow.Core.Accounts.User, foreign_key: :org_id

    timestamps(type: :utc_datetime)
  end

  def changeset(org, attrs) do
    org
    |> cast(attrs, [:name, :slug, :country, :currency, :timezone, :tax_id,
                    :address, :logo_url, :settings, :plan])
    |> slugify()
    |> validate_required([:name, :slug])
    |> unique_constraint(:slug)
  end

  defp slugify(%Ecto.Changeset{changes: %{name: name}} = cs) when not is_nil(name) do
    slug = name |> String.downcase() |> String.replace(~r/[^a-z0-9]+/, "-")
    put_change(cs, :slug, slug)
  end

  defp slugify(cs), do: cs
end
