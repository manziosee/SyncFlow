defmodule SyncFlow.CRM.Schema.Customer do
  use Ecto.Schema
  @derive {Jason.Encoder, except: [:__meta__]}
  import Ecto.Changeset

  @primary_key {:id, :binary_id, autogenerate: false}

  schema "customers" do
    field :org_id, :binary_id
    field :name, :string
    field :email, :string
    field :phone, :string
    field :type, Ecto.Enum, values: [:individual, :business], default: :individual
    field :status, Ecto.Enum, values: [:prospect, :active, :inactive, :blocked, :churned], default: :active
    field :address, :map
    field :country, :string
    field :industry, :string
    field :credit_limit, :decimal
    field :outstanding_balance, :decimal, default: Decimal.new("0")
    field :tags, {:array, :string}, default: []
    field :metadata, :map, default: %{}

    has_many :interactions, SyncFlow.CRM.Schema.Interaction, foreign_key: :customer_id

    timestamps(type: :utc_datetime)
  end

  def changeset(c, attrs) do
    c
    |> cast(attrs, [:id, :org_id, :name, :email, :phone, :type, :status, :address,
                    :country, :industry, :credit_limit, :outstanding_balance, :tags, :metadata])
    |> validate_required([:id, :org_id, :name])
  end
end

defmodule SyncFlow.CRM.Schema.Interaction do
  use Ecto.Schema
  @derive {Jason.Encoder, except: [:__meta__]}

  @primary_key {:id, :binary_id, autogenerate: false}

  schema "interactions" do
    field :customer_id, :binary_id
    field :type, Ecto.Enum, values: [:call, :email, :meeting, :visit, :note]
    field :notes, :string
    field :outcome, :string
    field :recorded_by, :binary_id
    field :occurred_at, :utc_datetime

    timestamps(type: :utc_datetime)
  end
end
