defmodule SyncFlow.HR.Queries do
  import Ecto.Query
  alias SyncFlow.HR.Repo
  alias SyncFlow.HR.Schema.{Employee, PayrollRun, PaySlip}

  def list_employees(org_id, opts \\ []) do
    status = Keyword.get(opts, :status)
    department = Keyword.get(opts, :department)
    search = Keyword.get(opts, :search)
    page = Keyword.get(opts, :page, 1)
    per_page = Keyword.get(opts, :per_page, 20)

    Employee
    |> where([e], e.org_id == ^org_id)
    |> maybe_filter_status(status)
    |> maybe_filter_department(department)
    |> maybe_search(search)
    |> order_by([e], e.name)
    |> paginate(page, per_page)
    |> Repo.all()
  end

  def get_employee(id), do: Repo.get(Employee, id)
  def get_employee!(id), do: Repo.get!(Employee, id)

  def create_employee(attrs) do
    %Employee{}
    |> Employee.changeset(attrs)
    |> Repo.insert()
  end

  def update_employee(%Employee{} = e, attrs) do
    e |> Employee.changeset(attrs) |> Repo.update()
  end

  def list_payroll_runs(org_id, opts \\ []) do
    status = Keyword.get(opts, :status)
    page = Keyword.get(opts, :page, 1)
    per_page = Keyword.get(opts, :per_page, 12)

    PayrollRun
    |> where([r], r.org_id == ^org_id)
    |> maybe_filter_payroll_status(status)
    |> order_by([r], desc: r.period_end)
    |> paginate(page, per_page)
    |> Repo.all()
  end

  def get_payroll_run(id), do: Repo.get(PayrollRun, id)
  def get_payroll_run!(id), do: Repo.get!(PayrollRun, id)

  def create_payroll_run(attrs) do
    %PayrollRun{}
    |> PayrollRun.changeset(attrs)
    |> Repo.insert()
  end

  def update_payroll_run(%PayrollRun{} = run, attrs) do
    run
    |> Ecto.Changeset.cast(attrs, [:status, :total_gross, :total_deductions, :total_net,
                                    :processed_by, :approved_by, :paid_at, :notes])
    |> Repo.update()
  end

  def process_payroll(run_id, processed_by) do
    run = get_payroll_run!(run_id)

    # Fetch all active employees
    employees = list_employees(run.org_id, status: :active)

    Repo.transaction(fn ->
      # Generate pay slips
      slips =
        Enum.map(employees, fn emp ->
          gross = emp.base_salary || Decimal.new("0")
          # Rwanda PAYE: 0% up to 60k, 20% up to 100k, 30% above
          tax = calculate_paye(gross)
          net = Decimal.sub(gross, tax)

          %PaySlip{
            id: UUID.uuid4(),
            org_id: run.org_id,
            payroll_run_id: run_id,
            employee_id: emp.id,
            employee_name: emp.name,
            gross_salary: gross,
            deductions: tax,
            net_salary: net,
            tax_amount: tax,
            currency: emp.currency || "RWF",
            status: :pending
          }
        end)

      Enum.each(slips, &Repo.insert!/1)

      total_gross = Enum.reduce(slips, Decimal.new("0"), fn s, acc -> Decimal.add(acc, s.gross_salary) end)
      total_deductions = Enum.reduce(slips, Decimal.new("0"), fn s, acc -> Decimal.add(acc, s.deductions) end)
      total_net = Decimal.sub(total_gross, total_deductions)

      update_payroll_run(run, %{
        status: :processing,
        total_gross: total_gross,
        total_deductions: total_deductions,
        total_net: total_net,
        processed_by: processed_by
      })
    end)
  end

  def approve_payroll(run_id, approved_by) do
    run = get_payroll_run!(run_id)
    update_payroll_run(run, %{status: :approved, approved_by: approved_by})
  end

  def list_pay_slips(payroll_run_id) do
    PaySlip
    |> where([s], s.payroll_run_id == ^payroll_run_id)
    |> order_by([s], s.employee_name)
    |> Repo.all()
  end

  def headcount_by_department(org_id) do
    Employee
    |> where([e], e.org_id == ^org_id and e.status == :active)
    |> group_by([e], e.department)
    |> select([e], {e.department, count(e.id)})
    |> Repo.all()
    |> Map.new()
  end

  defp calculate_paye(gross) do
    # Rwanda PAYE tax brackets (monthly RWF)
    g = Decimal.to_float(gross)

    cond do
      g <= 60_000 -> Decimal.new("0")
      g <= 100_000 -> Decimal.new(to_string(round((g - 60_000) * 0.20)))
      true -> Decimal.new(to_string(round(8_000 + (g - 100_000) * 0.30)))
    end
  end

  defp maybe_filter_status(q, nil), do: q
  defp maybe_filter_status(q, s), do: where(q, [e], e.status == ^s)

  defp maybe_filter_department(q, nil), do: q
  defp maybe_filter_department(q, d), do: where(q, [e], e.department == ^d)

  defp maybe_search(q, nil), do: q
  defp maybe_search(q, term) do
    pattern = "%#{term}%"
    where(q, [e], ilike(e.name, ^pattern) or ilike(e.email, ^pattern) or ilike(e.employee_number, ^pattern))
  end

  defp maybe_filter_payroll_status(q, nil), do: q
  defp maybe_filter_payroll_status(q, s), do: where(q, [r], r.status == ^s)

  defp paginate(q, page, per_page) do
    q |> limit(^per_page) |> offset(^((page - 1) * per_page))
  end
end
