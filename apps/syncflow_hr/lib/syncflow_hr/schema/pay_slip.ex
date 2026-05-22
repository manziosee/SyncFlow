defmodule SyncFlow.HR.Schema.PaySlip do
  use Ecto.Schema
  @derive {Jason.Encoder, except: [:__meta__]}
  import Ecto.Changeset

  @primary_key {:id, :binary_id, autogenerate: true}
  @foreign_key_type :binary_id

  schema "pay_slips" do
    field :org_id, :binary_id
    field :payroll_run_id, :binary_id
    field :employee_id, :binary_id
    field :employee_name, :string
    field :gross_salary, :decimal
    field :deductions, :decimal, default: Decimal.new("0")
    field :net_salary, :decimal
    field :tax_amount, :decimal, default: Decimal.new("0")
    field :allowances, :map, default: %{}
    field :currency, :string, default: "RWF"
    field :status, Ecto.Enum, values: [:pending, :paid], default: :pending

    belongs_to :payroll_run, SyncFlow.HR.Schema.PayrollRun,
      foreign_key: :payroll_run_id,
      define_field: false

    timestamps(type: :utc_datetime)
  end

  def changeset(slip, attrs) do
    slip
    |> cast(attrs, [:id, :org_id, :payroll_run_id, :employee_id, :employee_name,
                    :gross_salary, :deductions, :net_salary, :tax_amount,
                    :allowances, :currency, :status])
    |> validate_required([:org_id, :payroll_run_id, :employee_id, :gross_salary, :net_salary])
  end
end
