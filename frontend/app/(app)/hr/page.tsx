'use client'

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { hrApi } from '@/lib/api'
import PageHeroHeader, { HeroButton } from '@/components/dashboard/PageHeroHeader'
import {
  Users, DollarSign, Plus, Search, Loader2,
  RefreshCw, Play, CheckCircle, X, FileText,
  Briefcase, Building2
} from 'lucide-react'
import toast from 'react-hot-toast'
import clsx from 'clsx'

const fmtRwf = (n: number) =>
  new Intl.NumberFormat('en-RW', { maximumFractionDigits: 0 }).format(n) + ' RWF'

const fmtDate = (d: string) =>
  new Date(d).toLocaleDateString('en-RW', { day: '2-digit', month: 'short', year: 'numeric' })

interface Employee {
  id: string
  name: string
  email: string
  department: string
  position: string
  salary: number
  status: string
  hire_date?: string
}

interface PayrollRun {
  id: string
  period_start: string
  period_end: string
  status: string
  total_gross: number
  total_net: number
  employee_count: number
}

function AddEmployeeModal({ onClose }: { onClose: () => void }) {
  const qc = useQueryClient()
  const [form, setForm] = useState({
    name: '', email: '', department: '', position: '', salary: 0, hire_date: ''
  })

  const mutation = useMutation({
    mutationFn: () => hrApi.createEmployee(form as Record<string, unknown>),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['employees'] }); toast.success('Employee added'); onClose() },
    onError: () => toast.error('Failed to add employee'),
  })

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-ink">Add Employee</h3>
          <button onClick={onClose} className="text-ink-muted hover:text-ink"><X className="w-4 h-4" /></button>
        </div>
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-ink-secondary mb-1">Full Name</label>
              <input className="input" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="Jane Doe" required />
            </div>
            <div>
              <label className="block text-xs font-medium text-ink-secondary mb-1">Email</label>
              <input className="input" type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} placeholder="jane@company.com" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-ink-secondary mb-1">Department</label>
              <input className="input" value={form.department} onChange={e => setForm(f => ({ ...f, department: e.target.value }))} placeholder="Engineering" />
            </div>
            <div>
              <label className="block text-xs font-medium text-ink-secondary mb-1">Position</label>
              <input className="input" value={form.position} onChange={e => setForm(f => ({ ...f, position: e.target.value }))} placeholder="Software Engineer" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-ink-secondary mb-1">Gross Salary (RWF)</label>
              <input className="input" type="number" min="0" value={form.salary} onChange={e => setForm(f => ({ ...f, salary: Number(e.target.value) }))} />
            </div>
            <div>
              <label className="block text-xs font-medium text-ink-secondary mb-1">Hire Date</label>
              <input className="input" type="date" value={form.hire_date} onChange={e => setForm(f => ({ ...f, hire_date: e.target.value }))} />
            </div>
          </div>
        </div>
        <div className="flex gap-2 mt-4">
          <button onClick={onClose} className="btn-ghost flex-1">Cancel</button>
          <button onClick={() => mutation.mutate()} disabled={!form.name || mutation.isPending} className="btn-primary flex-1 gap-2">
            {mutation.isPending && <Loader2 className="w-4 h-4 animate-spin" />}
            Add Employee
          </button>
        </div>
      </div>
    </div>
  )
}

function CreatePayrollModal({ onClose }: { onClose: () => void }) {
  const qc = useQueryClient()
  const [form, setForm] = useState({ period_start: '', period_end: '', description: '' })

  const mutation = useMutation({
    mutationFn: () => hrApi.createPayrollRun(form as Record<string, unknown>),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['payroll-runs'] }); toast.success('Payroll run created'); onClose() },
    onError: () => toast.error('Failed to create payroll run'),
  })

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-2xl">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-ink">New Payroll Run</h3>
          <button onClick={onClose} className="text-ink-muted hover:text-ink"><X className="w-4 h-4" /></button>
        </div>
        <div className="space-y-3">
          <div>
            <label className="block text-xs font-medium text-ink-secondary mb-1">Period Start</label>
            <input className="input" type="date" value={form.period_start} onChange={e => setForm(f => ({ ...f, period_start: e.target.value }))} required />
          </div>
          <div>
            <label className="block text-xs font-medium text-ink-secondary mb-1">Period End</label>
            <input className="input" type="date" value={form.period_end} onChange={e => setForm(f => ({ ...f, period_end: e.target.value }))} required />
          </div>
          <div>
            <label className="block text-xs font-medium text-ink-secondary mb-1">Description</label>
            <input className="input" value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} placeholder="May 2025 Payroll" />
          </div>
        </div>
        <div className="flex gap-2 mt-4">
          <button onClick={onClose} className="btn-ghost flex-1">Cancel</button>
          <button onClick={() => mutation.mutate()} disabled={!form.period_start || !form.period_end || mutation.isPending} className="btn-primary flex-1 gap-2">
            {mutation.isPending && <Loader2 className="w-4 h-4 animate-spin" />}
            Create
          </button>
        </div>
      </div>
    </div>
  )
}

export default function HRPage() {
  const qc = useQueryClient()
  const [tab, setTab] = useState<'employees' | 'payroll'>('employees')
  const [search, setSearch] = useState('')
  const [showAddEmp, setShowAddEmp] = useState(false)
  const [showCreatePayroll, setShowCreatePayroll] = useState(false)
  const [expandedRun, setExpandedRun] = useState<string | null>(null)

  const { data: empData, isLoading: empLoading, refetch: refetchEmp } = useQuery({
    queryKey: ['employees', search],
    queryFn: () => hrApi.employees(search ? { search } : undefined).then(r => r.data?.data ?? r.data ?? []),
  })

  const { data: headcount } = useQuery({
    queryKey: ['headcount'],
    queryFn: () => hrApi.headcount().then(r => r.data),
  })

  const { data: payrollData, isLoading: payrollLoading } = useQuery({
    queryKey: ['payroll-runs'],
    queryFn: () => hrApi.payrollRuns().then(r => r.data?.data ?? r.data ?? []),
    enabled: tab === 'payroll',
  })

  const { data: paySlips } = useQuery({
    queryKey: ['pay-slips', expandedRun],
    queryFn: () => hrApi.paySlips(expandedRun!).then(r => r.data?.data ?? r.data ?? []),
    enabled: !!expandedRun,
  })

  const processMutation = useMutation({
    mutationFn: (id: string) => hrApi.processPayroll(id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['payroll-runs'] }); toast.success('Payroll processing started') },
    onError: () => toast.error('Failed to process'),
  })

  const approveMutation = useMutation({
    mutationFn: (id: string) => hrApi.approvePayroll(id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['payroll-runs'] }); toast.success('Payroll approved') },
    onError: () => toast.error('Failed to approve'),
  })

  const employees: Employee[] = empData ?? []
  const payrollRuns: PayrollRun[] = payrollData ?? []

  const departments = [...new Set(employees.map(e => e.department).filter(Boolean))]

  const PAYROLL_COLORS: Record<string, string> = {
    draft: 'badge-gray',
    processing: 'badge-blue',
    processed: 'badge-yellow',
    approved: 'badge-green',
    failed: 'badge-red',
  }

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <PageHeroHeader
        title="HR & Payroll"
        highlight="Payroll"
        subtitle="Employee management, payroll runs & pay slips"
        imageIndex={2}
        stats={[
          { label: 'employees', value: employees.length },
          { label: 'departments', value: departments.length },
        ]}
        actions={
          tab === 'employees' ? (
            <HeroButton variant="orange" onClick={() => setShowAddEmp(true)}>
              <Plus className="w-3.5 h-3.5" />
              Add Employee
            </HeroButton>
          ) : (
            <HeroButton variant="orange" onClick={() => setShowCreatePayroll(true)}>
              <Plus className="w-3.5 h-3.5" />
              New Payroll Run
            </HeroButton>
          )
        }
      />
      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        {/* KPI strip */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {[
            { label: 'Total Employees', value: employees.length, icon: Users, color: 'bg-primary-100 text-primary-600' },
            { label: 'Departments', value: departments.length, icon: Building2, color: 'bg-blue-100 text-blue-600' },
            { label: 'Payroll Runs', value: payrollRuns.length, icon: DollarSign, color: 'bg-purple-100 text-purple-600' },
            { label: 'Pending Approval', value: payrollRuns.filter(r => r.status === 'processed').length, icon: Briefcase, color: 'bg-warning-bg text-warning' },
          ].map(({ label, value, icon: Icon, color }) => (
            <div key={label} className="card p-4 flex items-center gap-3">
              <div className={clsx('w-9 h-9 rounded-xl flex items-center justify-center', color)}>
                <Icon className="w-4 h-4" />
              </div>
              <div>
                <div className="font-bold text-ink">{value}</div>
                <div className="text-xs text-ink-muted">{label}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Department breakdown */}
        {headcount?.by_department && (
          <div className="card p-4">
            <h3 className="text-sm font-semibold text-ink mb-3">Headcount by Department</h3>
            <div className="flex flex-wrap gap-2">
              {Object.entries(headcount.by_department).map(([dept, count]) => (
                <div key={dept} className="flex items-center gap-2 bg-slate-50 rounded-lg px-3 py-1.5">
                  <span className="text-sm font-medium text-ink">{dept}</span>
                  <span className="bg-primary-100 text-primary-700 text-xs font-bold px-1.5 py-0.5 rounded-full">{String(count)}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tabs */}
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="flex bg-slate-100 rounded-xl p-1 gap-1">
            {(['employees', 'payroll'] as const).map(t => (
              <button key={t} onClick={() => setTab(t)}
                className={clsx('px-4 py-1.5 rounded-lg text-sm font-medium transition-all capitalize',
                  tab === t ? 'bg-white text-ink shadow-sm' : 'text-ink-muted hover:text-ink')}>
                {t === 'employees' ? 'Employees' : 'Payroll Runs'}
              </button>
            ))}
          </div>
          <div className="flex gap-2">
            {tab === 'employees' ? (
              <>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-muted" />
                  <input className="input pl-9 w-48" placeholder="Search employees…" value={search} onChange={e => setSearch(e.target.value)} />
                </div>
                <button onClick={() => refetchEmp()} className="btn-ghost"><RefreshCw className={clsx('w-4 h-4', empLoading && 'animate-spin')} /></button>
                <button onClick={() => setShowAddEmp(true)} className="btn-primary gap-2">
                  <Plus className="w-4 h-4" />Add Employee
                </button>
              </>
            ) : (
              <button onClick={() => setShowCreatePayroll(true)} className="btn-primary gap-2">
                <Plus className="w-4 h-4" />New Payroll Run
              </button>
            )}
          </div>
        </div>

        {/* Employees table */}
        {tab === 'employees' && (
          <div className="card overflow-hidden">
            <table className="table">
              <thead>
                <tr>
                  <th>Employee</th>
                  <th>Department</th>
                  <th>Position</th>
                  <th className="text-right">Salary</th>
                  <th>Status</th>
                  <th>Hire Date</th>
                </tr>
              </thead>
              <tbody>
                {empLoading ? (
                  <tr><td colSpan={6} className="text-center py-12"><Loader2 className="w-6 h-6 animate-spin mx-auto text-ink-muted" /></td></tr>
                ) : employees.length === 0 ? (
                  <tr><td colSpan={6} className="text-center py-12 text-ink-muted">
                    <Users className="w-10 h-10 mx-auto mb-2 opacity-30" />
                    No employees found
                  </td></tr>
                ) : employees.map(emp => (
                  <tr key={emp.id}>
                    <td>
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center text-primary-700 font-bold text-xs">
                          {emp.name?.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <div className="font-medium text-ink">{emp.name}</div>
                          <div className="text-xs text-ink-muted">{emp.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="text-ink-secondary">{emp.department || '—'}</td>
                    <td className="text-ink-secondary text-sm">{emp.position || '—'}</td>
                    <td className="text-right font-semibold text-ink">{fmtRwf(emp.salary)}</td>
                    <td>
                      <span className={emp.status === 'active' ? 'badge-green' : 'badge-gray'}>
                        {emp.status}
                      </span>
                    </td>
                    <td className="text-ink-muted text-sm">{emp.hire_date ? fmtDate(emp.hire_date) : '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Payroll runs */}
        {tab === 'payroll' && (
          <div className="space-y-3">
            {payrollLoading ? (
              <div className="flex justify-center py-12"><Loader2 className="w-6 h-6 animate-spin text-ink-muted" /></div>
            ) : payrollRuns.length === 0 ? (
              <div className="card text-center py-12 text-ink-muted">
                <DollarSign className="w-10 h-10 mx-auto mb-2 opacity-30" />
                No payroll runs yet
              </div>
            ) : payrollRuns.map(run => (
              <div key={run.id} className="card overflow-hidden">
                <div className="p-4 flex items-center justify-between flex-wrap gap-3">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className={PAYROLL_COLORS[run.status] ?? 'badge-gray'}>{run.status}</span>
                      <span className="text-sm text-ink-muted">
                        {fmtDate(run.period_start)} → {fmtDate(run.period_end)}
                      </span>
                    </div>
                    <div className="flex gap-4 text-sm">
                      <span className="text-ink-muted">{run.employee_count} employees</span>
                      <span className="text-ink">Gross: <strong>{fmtRwf(run.total_gross)}</strong></span>
                      <span className="text-primary-600">Net: <strong>{fmtRwf(run.total_net)}</strong></span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    {run.status === 'draft' && (
                      <button onClick={() => processMutation.mutate(run.id)} disabled={processMutation.isPending}
                        className="btn-ghost gap-1.5 text-sm">
                        {processMutation.isPending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Play className="w-3.5 h-3.5" />}
                        Process
                      </button>
                    )}
                    {run.status === 'processed' && (
                      <button onClick={() => approveMutation.mutate(run.id)} disabled={approveMutation.isPending}
                        className="btn-primary text-sm gap-1.5">
                        {approveMutation.isPending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <CheckCircle className="w-3.5 h-3.5" />}
                        Approve
                      </button>
                    )}
                    <button
                      onClick={() => setExpandedRun(expandedRun === run.id ? null : run.id)}
                      className="btn-ghost text-sm gap-1.5"
                    >
                      <FileText className="w-3.5 h-3.5" />
                      Pay Slips
                    </button>
                  </div>
                </div>
                {expandedRun === run.id && (
                  <div className="border-t border-slate-100">
                    <table className="table">
                      <thead>
                        <tr>
                          <th>Employee</th>
                          <th className="text-right">Gross</th>
                          <th className="text-right">Tax</th>
                          <th className="text-right">Net</th>
                        </tr>
                      </thead>
                      <tbody>
                        {(paySlips ?? []).map((slip: Record<string, unknown>) => (
                          <tr key={String(slip.id)}>
                            <td>{String(slip.employee_name ?? '—')}</td>
                            <td className="text-right">{fmtRwf(Number(slip.gross_salary ?? 0))}</td>
                            <td className="text-right text-danger">{fmtRwf(Number(slip.tax_deduction ?? 0))}</td>
                            <td className="text-right font-semibold text-primary-600">{fmtRwf(Number(slip.net_salary ?? 0))}</td>
                          </tr>
                        ))}
                        {(!paySlips || paySlips.length === 0) && (
                          <tr><td colSpan={4} className="text-center py-4 text-ink-muted text-sm">No pay slips generated yet</td></tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {showAddEmp && <AddEmployeeModal onClose={() => setShowAddEmp(false)} />}
      {showCreatePayroll && <CreatePayrollModal onClose={() => setShowCreatePayroll(false)} />}
    </div>
  )
}
