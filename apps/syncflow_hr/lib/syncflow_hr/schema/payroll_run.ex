defmodule SyncFlow.HR.Schema.PayrollRun do
  use Ecto.Schema
  import Ecto.Changeset

  @primary_key {:id, :binary_id, autogenerate: true}

  schema "payroll_runs" do
    field :org_id, :binary_id
    field :period_start, :date
    field :period_end, :date
    field :status, Ecto.Enum, values: [:draft, :processing, :approved, :paid, :cancelled], default: :draft
    field :total_gross, :decimal, default: Decimal.new("0")
    field :total_deductions, :decimal, default: Decimal.new("0")
    field :total_net, :decimal, default: Decimal.new("0")
    field :currency, :string, default: "RWF"
    field :processed_by, :binary_id
    field :approved_by, :binary_id
    field :paid_at, :utc_datetime
    field :notes, :string

    has_many :pay_slips, SyncFlow.HR.Schema.PaySlip, foreign_key: :payroll_run_id

    timestamps(type: :utc_datetime)
  end

  def changeset(r, attrs) do
    r
    |> cast(attrs, [:org_id, :period_start, :period_end, :currency, :notes])
    |> validate_required([:org_id, :period_start, :period_end])
  end
end

