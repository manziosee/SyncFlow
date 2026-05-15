defmodule SyncFlow.HR.Repo.Migrations.CreateHRTables do
  use Ecto.Migration

  def change do
    create table(:employees, primary_key: false) do
      add :id, :binary_id, primary_key: true
      add :org_id, :binary_id, null: false
      add :user_id, :binary_id
      add :employee_number, :string
      add :name, :string, null: false
      add :email, :string
      add :phone, :string
      add :department, :string
      add :position, :string
      add :employment_type, :string
      add :status, :string, default: "probation"
      add :hire_date, :date
      add :termination_date, :date
      add :base_salary, :decimal, precision: 15, scale: 2
      add :currency, :string, default: "RWF"
      add :pay_frequency, :string, default: "monthly"
      add :bank_account, :jsonb
      add :national_id, :string
      add :tax_id, :string
      add :emergency_contact, :jsonb
      add :address, :jsonb
      add :manager_id, :binary_id
      add :metadata, :jsonb, default: "{}"

      timestamps(type: :utc_datetime)
    end

    create index(:employees, [:org_id])
    create index(:employees, [:status])
    create unique_index(:employees, [:employee_number, :org_id])

    create table(:payroll_runs, primary_key: false) do
      add :id, :binary_id, primary_key: true
      add :org_id, :binary_id, null: false
      add :period_start, :date, null: false
      add :period_end, :date, null: false
      add :status, :string, default: "draft"
      add :total_gross, :decimal, precision: 15, scale: 2, default: 0
      add :total_deductions, :decimal, precision: 15, scale: 2, default: 0
      add :total_net, :decimal, precision: 15, scale: 2, default: 0
      add :currency, :string, default: "RWF"
      add :processed_by, :binary_id
      add :approved_by, :binary_id
      add :paid_at, :utc_datetime
      add :notes, :text

      timestamps(type: :utc_datetime)
    end

    create index(:payroll_runs, [:org_id])
    create index(:payroll_runs, [:status])

    create table(:pay_slips, primary_key: false) do
      add :id, :binary_id, primary_key: true
      add :org_id, :binary_id
      add :payroll_run_id, references(:payroll_runs, type: :binary_id)
      add :employee_id, references(:employees, type: :binary_id)
      add :employee_name, :string
      add :gross_salary, :decimal, precision: 15, scale: 2
      add :deductions, :decimal, precision: 15, scale: 2, default: 0
      add :net_salary, :decimal, precision: 15, scale: 2
      add :tax_amount, :decimal, precision: 15, scale: 2, default: 0
      add :allowances, :jsonb
      add :currency, :string, default: "RWF"
      add :status, :string, default: "pending"

      timestamps(type: :utc_datetime)
    end

    create index(:pay_slips, [:payroll_run_id])
    create index(:pay_slips, [:employee_id])
  end
end
