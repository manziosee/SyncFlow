defmodule SyncFlow.HR.Schema.Employee do
  use Ecto.Schema
  import Ecto.Changeset

  @primary_key {:id, :binary_id, autogenerate: true}

  schema "employees" do
    field :org_id, :binary_id
    field :user_id, :binary_id
    field :employee_number, :string
    field :name, :string
    field :email, :string
    field :phone, :string
    field :department, :string
    field :position, :string
    field :employment_type, Ecto.Enum, values: [:full_time, :part_time, :contract, :intern]
    field :status, Ecto.Enum, values: [:active, :on_leave, :terminated, :probation], default: :probation
    field :hire_date, :date
    field :termination_date, :date
    field :base_salary, :decimal
    field :currency, :string, default: "RWF"
    field :pay_frequency, Ecto.Enum, values: [:monthly, :biweekly, :weekly], default: :monthly
    field :bank_account, :map
    field :national_id, :string
    field :tax_id, :string
    field :emergency_contact, :map
    field :address, :map
    field :manager_id, :binary_id
    field :metadata, :map, default: %{}

    timestamps(type: :utc_datetime)
  end

  def changeset(e, attrs) do
    e
    |> cast(attrs, [:org_id, :user_id, :employee_number, :name, :email, :phone,
                    :department, :position, :employment_type, :status, :hire_date,
                    :base_salary, :currency, :pay_frequency, :bank_account,
                    :national_id, :tax_id, :emergency_contact, :address, :manager_id])
    |> validate_required([:org_id, :name, :employment_type, :hire_date])
    |> unique_constraint(:employee_number, name: :employees_employee_number_org_id_index)
  end
end
