'use client'

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { hrApi } from '@/lib/api'
import PageHeroHeader, { HeroButton } from '@/components/dashboard/PageHeroHeader'
import {
  Users, DollarSign, Plus, Search, Loader2,
  RefreshCw, Play, CheckCircle, X, FileText,
  Briefcase, Building2, Eye, Edit2, Trash2,
  Mail, Phone, Calendar, Hash, TrendingUp,
} from 'lucide-react'
import toast from 'react-hot-toast'
import clsx from 'clsx'
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  CartesianGrid, PieChart, Pie, Cell,
} from 'recharts'

const fmtRwf = (n: number) =>
  new Intl.NumberFormat('en-RW', { maximumFractionDigits: 0 }).format(n) + ' RWF'
const fmtRwfShort = (n: number) => {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + 'M'
  if (n >= 1_000) return (n / 1_000).toFixed(0) + 'K'
  return String(n)
}
const fmtDate = (d: string) =>
  new Date(d).toLocaleDateString('en-RW', { day: '2-digit', month: 'short', year: 'numeric' })

const BAR_TAILWIND = ['bg-orange-500', 'bg-blue-500', 'bg-emerald-500', 'bg-purple-500', 'bg-pink-500', 'bg-amber-500', 'bg-cyan-500']

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

function ActionBtn({
  onClick, variant = 'view', label, icon: Icon, disabled,
}: {
  onClick: () => void
  variant?: 'view' | 'edit' | 'delete'
  label: string
  icon: React.ElementType
  disabled?: boolean
}) {
  const styles = {
    view:   'text-slate-500 hover:text-blue-700 hover:bg-blue-50 border-slate-200 hover:border-blue-200',
    edit:   'text-slate-500 hover:text-orange-700 hover:bg-orange-50 border-slate-200 hover:border-orange-200',
    delete: 'text-slate-500 hover:text-red-700 hover:bg-red-50 border-slate-200 hover:border-red-200',
  }
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={clsx(
        'inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border text-xs font-medium transition-all disabled:opacity-40 disabled:cursor-not-allowed',
        styles[variant],
      )}
    >
      <Icon className="w-3.5 h-3.5" />
      {label}
    </button>
  )
}

/* ── View Employee Modal ────────────────────────────────────── */
function ViewEmployeeModal({ emp, onClose, onEdit }: { emp: Employee; onClose: () => void; onEdit: () => void }) {
  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-sm shadow-2xl">
        <div className="flex items-center justify-between p-5 border-b border-slate-100">
          <h3 className="font-bold text-slate-900 text-base">Employee Profile</h3>
          <button type="button" onClick={onClose} aria-label="Close" className="text-slate-400 hover:text-slate-600"><X className="w-5 h-5" /></button>
        </div>
        <div className="p-5 space-y-4">
          {/* Avatar + name */}
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-orange-100 rounded-2xl flex items-center justify-center text-orange-700 font-extrabold text-xl shrink-0">
              {emp.name?.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
            </div>
            <div>
              <p className="font-bold text-slate-900 text-lg">{emp.name}</p>
              <p className="text-sm text-slate-500">{emp.position || 'No title set'}</p>
              <span className={clsx('inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold mt-1',
                emp.status === 'active' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-600')}>
                {emp.status === 'active' ? 'Active' : 'Inactive'}
              </span>
            </div>
          </div>
          {/* Info grid */}
          <div className="space-y-2.5">
            <div className="flex items-center gap-3 text-sm">
              <Mail className="w-4 h-4 text-slate-400 shrink-0" />
              <span className="text-slate-700">{emp.email || '—'}</span>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <Building2 className="w-4 h-4 text-slate-400 shrink-0" />
              <span className="text-slate-700">{emp.department || '—'}</span>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <Briefcase className="w-4 h-4 text-slate-400 shrink-0" />
              <span className="text-slate-700">{emp.position || '—'}</span>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <Calendar className="w-4 h-4 text-slate-400 shrink-0" />
              <span className="text-slate-700">Hired: {emp.hire_date ? fmtDate(emp.hire_date) : '—'}</span>
            </div>
            <div className="flex items-center justify-between bg-orange-50 rounded-xl px-4 py-3 mt-2">
              <div className="flex items-center gap-2 text-sm text-slate-600">
                <TrendingUp className="w-4 h-4 text-orange-500" />
                Gross Monthly Salary
              </div>
              <span className="font-extrabold text-orange-600">{fmtRwf(emp.salary)}</span>
            </div>
          </div>
        </div>
        <div className="flex gap-2 p-5 border-t border-slate-100">
          <button type="button" onClick={onClose} className="flex-1 py-2 rounded-xl border border-slate-200 text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors">Close</button>
          <button type="button" onClick={onEdit} className="flex-1 py-2 rounded-xl bg-orange-500 hover:bg-orange-400 text-white text-sm font-semibold transition-colors">Edit Employee</button>
        </div>
      </div>
    </div>
  )
}

/* ── Edit Employee Modal ────────────────────────────────────── */
function EditEmployeeModal({ emp, onClose }: { emp: Employee; onClose: () => void }) {
  const qc = useQueryClient()
  const [form, setForm] = useState({
    name: emp.name,
    email: emp.email,
    department: emp.department,
    position: emp.position,
    salary: emp.salary,
    status: emp.status,
    hire_date: emp.hire_date ?? '',
  })

  const mutation = useMutation({
    mutationFn: async () => { await hrApi.updateEmployee(emp.id, form as Record<string, unknown>) },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['employees'] }); toast.success('Employee updated'); onClose() },
    onError: () => toast.error('Update failed'),
  })

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl">
        <div className="flex items-center justify-between mb-5">
          <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
            <Edit2 className="w-4 h-4 text-orange-500" />Edit Employee
          </h3>
          <button type="button" onClick={onClose} aria-label="Close" className="text-slate-400 hover:text-slate-600"><X className="w-5 h-5" /></button>
        </div>
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label htmlFor="edit-emp-name" className="block text-xs font-medium text-slate-600 mb-1">Full Name</label>
              <input id="edit-emp-name" className="input" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
            </div>
            <div>
              <label htmlFor="edit-emp-email" className="block text-xs font-medium text-slate-600 mb-1">Email</label>
              <input id="edit-emp-email" className="input" type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label htmlFor="edit-emp-dept" className="block text-xs font-medium text-slate-600 mb-1">Department</label>
              <input id="edit-emp-dept" className="input" value={form.department} onChange={e => setForm(f => ({ ...f, department: e.target.value }))} />
            </div>
            <div>
              <label htmlFor="edit-emp-pos" className="block text-xs font-medium text-slate-600 mb-1">Position</label>
              <input id="edit-emp-pos" className="input" value={form.position} onChange={e => setForm(f => ({ ...f, position: e.target.value }))} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label htmlFor="edit-emp-salary" className="block text-xs font-medium text-slate-600 mb-1">Gross Salary (RWF)</label>
              <input id="edit-emp-salary" className="input" type="number" min="0" value={form.salary} onChange={e => setForm(f => ({ ...f, salary: Number(e.target.value) }))} />
            </div>
            <div>
              <label htmlFor="edit-emp-status" className="block text-xs font-medium text-slate-600 mb-1">Status</label>
              <select id="edit-emp-status" className="input" value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value }))}>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="on_leave">On Leave</option>
              </select>
            </div>
          </div>
          <div>
            <label htmlFor="edit-emp-hire" className="block text-xs font-medium text-slate-600 mb-1">Hire Date</label>
            <input id="edit-emp-hire" className="input" type="date" value={form.hire_date} onChange={e => setForm(f => ({ ...f, hire_date: e.target.value }))} />
          </div>
        </div>
        <div className="flex gap-2 mt-5">
          <button type="button" onClick={onClose} className="flex-1 py-2 rounded-xl border border-slate-200 text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors">Cancel</button>
          <button type="button" onClick={() => mutation.mutate()} disabled={!form.name || mutation.isPending}
            className="flex-1 flex items-center justify-center gap-2 py-2 rounded-xl bg-orange-500 hover:bg-orange-400 text-white text-sm font-semibold transition-colors disabled:opacity-50">
            {mutation.isPending && <Loader2 className="w-4 h-4 animate-spin" />}Save Changes
          </button>
        </div>
      </div>
    </div>
  )
}

/* ── View Payroll Run Modal ─────────────────────────────────── */
function ViewPayrollModal({ run, paySlips, onClose }: { run: PayrollRun; paySlips: Record<string, unknown>[]; onClose: () => void }) {
  const tax = run.total_gross - run.total_net
  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl">
        <div className="flex items-center justify-between p-5 border-b border-slate-100">
          <div>
            <h3 className="font-bold text-slate-900 text-base">Payroll Run Details</h3>
            <p className="text-xs text-slate-500 mt-0.5">{fmtDate(run.period_start)} → {fmtDate(run.period_end)}</p>
          </div>
          <button type="button" onClick={onClose} aria-label="Close" className="text-slate-400 hover:text-slate-600"><X className="w-5 h-5" /></button>
        </div>
        <div className="p-5 space-y-4">
          {/* Summary cards */}
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-slate-50 rounded-xl p-3 text-center">
              <p className="text-2xl font-extrabold text-slate-900">{run.employee_count}</p>
              <p className="text-xs text-slate-500 mt-0.5">Employees</p>
            </div>
            <div className="bg-orange-50 rounded-xl p-3 text-center">
              <p className="text-lg font-extrabold text-orange-700">{fmtRwfShort(run.total_gross)}</p>
              <p className="text-xs text-slate-500 mt-0.5">Gross Total</p>
            </div>
            <div className="bg-emerald-50 rounded-xl p-3 text-center">
              <p className="text-lg font-extrabold text-emerald-700">{fmtRwfShort(run.total_net)}</p>
              <p className="text-xs text-slate-500 mt-0.5">Net Pay</p>
            </div>
          </div>
          <div className="bg-red-50 rounded-xl p-3 flex items-center justify-between text-sm">
            <span className="text-slate-600">Total Tax Deductions</span>
            <span className="font-bold text-red-600">{fmtRwf(tax > 0 ? tax : 0)}</span>
          </div>
          {/* Pay slips preview */}
          {paySlips.length > 0 && (
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Pay Slips ({paySlips.length})</p>
              <div className="space-y-1.5 max-h-52 overflow-y-auto">
                {paySlips.map(slip => (
                  <div key={String(slip.id)} className="flex items-center justify-between py-2 px-3 bg-slate-50 rounded-xl">
                    <span className="text-sm font-medium text-slate-800">{String(slip.employee_name ?? '—')}</span>
                    <div className="text-right">
                      <p className="text-xs text-slate-500">{fmtRwf(Number(slip.gross_salary ?? 0))} gross</p>
                      <p className="text-sm font-bold text-orange-600">{fmtRwf(Number(slip.net_salary ?? 0))} net</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
        <div className="p-5 border-t border-slate-100">
          <button type="button" onClick={onClose} className="w-full py-2 rounded-xl border border-slate-200 text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors">Close</button>
        </div>
      </div>
    </div>
  )
}

/* ── Delete Confirm Modal ───────────────────────────────────── */
function DeleteConfirmModal({
  title, description, onConfirm, onClose, isPending,
}: {
  title: string; description: string;
  onConfirm: () => void; onClose: () => void; isPending?: boolean
}) {
  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-2xl">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-red-100 rounded-xl flex items-center justify-center shrink-0">
            <Trash2 className="w-5 h-5 text-red-500" />
          </div>
          <div>
            <h3 className="font-bold text-slate-900">{title}</h3>
            <p className="text-xs text-slate-500 mt-0.5">{description}</p>
          </div>
        </div>
        <div className="bg-red-50 border border-red-100 rounded-xl p-3 mb-4">
          <p className="text-xs text-red-700">This action cannot be undone. All associated records will be permanently removed.</p>
        </div>
        <div className="flex gap-2">
          <button type="button" onClick={onClose} className="flex-1 py-2 rounded-xl border border-slate-200 text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors">Cancel</button>
          <button type="button" onClick={onConfirm} disabled={isPending}
            className="flex-1 flex items-center justify-center gap-2 py-2 rounded-xl bg-red-500 hover:bg-red-600 text-white text-sm font-semibold transition-colors disabled:opacity-50">
            {isPending && <Loader2 className="w-4 h-4 animate-spin" />}Delete
          </button>
        </div>
      </div>
    </div>
  )
}

/* ── Add Employee Modal ─────────────────────────────────────── */
function AddEmployeeModal({ onClose }: { onClose: () => void }) {
  const qc = useQueryClient()
  const [form, setForm] = useState({ name: '', email: '', department: '', position: '', salary: 0, hire_date: '' })

  const mutation = useMutation({
    mutationFn: async () => { await hrApi.createEmployee(form as Record<string, unknown>) },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['employees'] }); toast.success('Employee added'); onClose() },
    onError: () => toast.error('Failed to add employee'),
  })

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl">
        <div className="flex items-center justify-between mb-5">
          <h3 className="font-bold text-slate-900 text-base flex items-center gap-2"><Plus className="w-4 h-4 text-orange-500" />Add New Employee</h3>
          <button type="button" onClick={onClose} aria-label="Close" className="text-slate-400 hover:text-slate-600"><X className="w-4 h-4" /></button>
        </div>
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label htmlFor="emp-name" className="block text-xs font-medium text-slate-600 mb-1">Full Name</label>
              <input id="emp-name" className="input" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="Jane Doe" required />
            </div>
            <div>
              <label htmlFor="emp-email" className="block text-xs font-medium text-slate-600 mb-1">Email</label>
              <input id="emp-email" className="input" type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} placeholder="jane@company.com" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label htmlFor="emp-dept" className="block text-xs font-medium text-slate-600 mb-1">Department</label>
              <input id="emp-dept" className="input" value={form.department} onChange={e => setForm(f => ({ ...f, department: e.target.value }))} placeholder="Engineering" />
            </div>
            <div>
              <label htmlFor="emp-position" className="block text-xs font-medium text-slate-600 mb-1">Position</label>
              <input id="emp-position" className="input" value={form.position} onChange={e => setForm(f => ({ ...f, position: e.target.value }))} placeholder="Software Engineer" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label htmlFor="emp-salary" className="block text-xs font-medium text-slate-600 mb-1">Gross Salary (RWF)</label>
              <input id="emp-salary" className="input" type="number" min="0" value={form.salary} onChange={e => setForm(f => ({ ...f, salary: Number(e.target.value) }))} />
            </div>
            <div>
              <label htmlFor="emp-hire" className="block text-xs font-medium text-slate-600 mb-1">Hire Date</label>
              <input id="emp-hire" className="input" type="date" value={form.hire_date} onChange={e => setForm(f => ({ ...f, hire_date: e.target.value }))} />
            </div>
          </div>
        </div>
        <div className="flex gap-2 mt-5">
          <button type="button" onClick={onClose} className="flex-1 py-2 rounded-xl border border-slate-200 text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors">Cancel</button>
          <button type="button" onClick={() => mutation.mutate()} disabled={!form.name || mutation.isPending}
            className="flex-1 flex items-center justify-center gap-2 py-2 rounded-xl bg-orange-500 hover:bg-orange-400 text-white text-sm font-semibold transition-colors disabled:opacity-50">
            {mutation.isPending && <Loader2 className="w-4 h-4 animate-spin" />}Add Employee
          </button>
        </div>
      </div>
    </div>
  )
}

/* ── Create Payroll Modal ───────────────────────────────────── */
function CreatePayrollModal({ onClose }: { onClose: () => void }) {
  const qc = useQueryClient()
  const [form, setForm] = useState({ period_start: '', period_end: '', description: '' })

  const mutation = useMutation({
    mutationFn: async () => { await hrApi.createPayrollRun(form as Record<string, unknown>) },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['payroll-runs'] }); toast.success('Payroll run created'); onClose() },
    onError: () => toast.error('Failed to create payroll run'),
  })

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-2xl">
        <div className="flex items-center justify-between mb-5">
          <h3 className="font-bold text-slate-900 text-base flex items-center gap-2"><Plus className="w-4 h-4 text-orange-500" />New Payroll Run</h3>
          <button type="button" onClick={onClose} aria-label="Close" className="text-slate-400 hover:text-slate-600"><X className="w-4 h-4" /></button>
        </div>
        <div className="space-y-3">
          <div>
            <label htmlFor="pr-start" className="block text-xs font-medium text-slate-600 mb-1">Period Start</label>
            <input id="pr-start" className="input" type="date" value={form.period_start} onChange={e => setForm(f => ({ ...f, period_start: e.target.value }))} required />
          </div>
          <div>
            <label htmlFor="pr-end" className="block text-xs font-medium text-slate-600 mb-1">Period End</label>
            <input id="pr-end" className="input" type="date" value={form.period_end} onChange={e => setForm(f => ({ ...f, period_end: e.target.value }))} required />
          </div>
          <div>
            <label htmlFor="pr-desc" className="block text-xs font-medium text-slate-600 mb-1">Description</label>
            <input id="pr-desc" className="input" value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} placeholder="e.g. May 2025 Payroll" />
          </div>
        </div>
        <div className="flex gap-2 mt-5">
          <button type="button" onClick={onClose} className="flex-1 py-2 rounded-xl border border-slate-200 text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors">Cancel</button>
          <button type="button" onClick={() => mutation.mutate()} disabled={!form.period_start || !form.period_end || mutation.isPending}
            className="flex-1 flex items-center justify-center gap-2 py-2 rounded-xl bg-orange-500 hover:bg-orange-400 text-white text-sm font-semibold transition-colors disabled:opacity-50">
            {mutation.isPending && <Loader2 className="w-4 h-4 animate-spin" />}Create Run
          </button>
        </div>
      </div>
    </div>
  )
}

/* ── Main Page ──────────────────────────────────────────────── */
export default function HRPage() {
  const qc = useQueryClient()
  const [tab, setTab] = useState<'employees' | 'payroll'>('employees')
  const [search, setSearch] = useState('')
  const [showAddEmp, setShowAddEmp]           = useState(false)
  const [showCreatePayroll, setShowCreatePayroll] = useState(false)
  const [viewEmp, setViewEmp]     = useState<Employee | null>(null)
  const [editEmp, setEditEmp]     = useState<Employee | null>(null)
  const [deleteEmp, setDeleteEmp] = useState<Employee | null>(null)
  const [viewRun, setViewRun]     = useState<PayrollRun | null>(null)
  const [deleteRun, setDeleteRun] = useState<PayrollRun | null>(null)
  const [expandedRun, setExpandedRun] = useState<string | null>(null)

  const { data: empData, isLoading: empLoading, refetch: refetchEmp } = useQuery({
    queryKey: ['employees', search],
    queryFn: () => hrApi.employees(search ? { search } : undefined).then(r => r.data?.data ?? r.data ?? []),
  })

  const { data: headcount } = useQuery({
    queryKey: ['headcount'],
    queryFn: () => hrApi.headcount().then(r => r.data?.data ?? r.data),
  })

  const { data: payrollData, isLoading: payrollLoading } = useQuery({
    queryKey: ['payroll-runs'],
    queryFn: () => hrApi.payrollRuns().then(r => r.data?.data ?? r.data ?? []),
    enabled: tab === 'payroll',
  })

  const { data: paySlipsData } = useQuery({
    queryKey: ['pay-slips', expandedRun ?? viewRun?.id],
    queryFn: () => hrApi.paySlips((expandedRun ?? viewRun?.id)!).then(r => r.data?.data ?? r.data ?? []),
    enabled: !!(expandedRun || viewRun),
  })

  const processMutation = useMutation({
    mutationFn: async (id: string) => { await hrApi.processPayroll(id) },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['payroll-runs'] }); toast.success('Payroll processing started') },
    onError: () => toast.error('Failed to process'),
  })

  const approveMutation = useMutation({
    mutationFn: async (id: string) => { await hrApi.approvePayroll(id) },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['payroll-runs'] }); toast.success('Payroll approved') },
    onError: () => toast.error('Failed to approve'),
  })

  const deleteEmpMutation = useMutation({
    mutationFn: async (id: string) => { await hrApi.deleteEmployee(id) },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['employees'] }); toast.success('Employee removed'); setDeleteEmp(null) },
    onError: () => toast.error('Delete failed'),
  })

  const deleteRunMutation = useMutation({
    mutationFn: async (id: string) => { await hrApi.deletePayrollRun(id) },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['payroll-runs'] }); toast.success('Payroll run deleted'); setDeleteRun(null) },
    onError: () => toast.error('Delete failed'),
  })

  const employees: Employee[] = empData ?? []
  const payrollRuns: PayrollRun[] = payrollData ?? []
  const paySlips: Record<string, unknown>[] = paySlipsData ?? []
  const departments = [...new Set(employees.map(e => e.department).filter(Boolean))]
  const totalPayroll = employees.reduce((s, e) => s + e.salary, 0)

  const deptChartData = Object.entries(
    employees.reduce<Record<string, { count: number; payroll: number }>>((acc, emp) => {
      const dept = emp.department || 'Other'
      if (!acc[dept]) acc[dept] = { count: 0, payroll: 0 }
      acc[dept].count += 1
      acc[dept].payroll += emp.salary
      return acc
    }, {})
  ).map(([dept, v]) => ({ dept: dept.length > 10 ? dept.slice(0, 9) + '…' : dept, ...v }))

  const statusPieData = [
    { name: 'Active',   value: employees.filter(e => e.status === 'active').length,   color: '#10b981', dotClass: 'bg-emerald-500' },
    { name: 'Inactive', value: employees.filter(e => e.status !== 'active').length,   color: '#94a3b8', dotClass: 'bg-slate-400' },
  ].filter(d => d.value > 0)

  const PAYROLL_COLORS: Record<string, string> = {
    draft: 'badge-gray', processing: 'badge-blue', processed: 'badge-yellow',
    approved: 'badge-green', failed: 'badge-red',
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
              <Plus className="w-3.5 h-3.5" />Add Employee
            </HeroButton>
          ) : (
            <HeroButton variant="orange" onClick={() => setShowCreatePayroll(true)}>
              <Plus className="w-3.5 h-3.5" />New Payroll Run
            </HeroButton>
          )
        }
      />

      <div className="flex-1 overflow-y-auto p-6 space-y-5">

        {/* ── KPI strip ─────────────────────────── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {[
            { label: 'Total Employees',  value: employees.length,                                         icon: Users,      color: 'bg-orange-50 text-orange-600' },
            { label: 'Departments',      value: departments.length,                                       icon: Building2,  color: 'bg-blue-50 text-blue-600' },
            { label: 'Payroll Runs',     value: payrollRuns.length,                                       icon: DollarSign, color: 'bg-purple-50 text-purple-600' },
            { label: 'Pending Approval', value: payrollRuns.filter(r => r.status === 'processed').length, icon: Briefcase,  color: 'bg-amber-50 text-amber-600' },
          ].map(({ label, value, icon: Icon, color }) => (
            <div key={label} className="card p-4 flex items-center gap-3">
              <div className={clsx('w-10 h-10 rounded-xl flex items-center justify-center shrink-0', color)}>
                <Icon className="w-5 h-5" />
              </div>
              <div>
                <div className="text-xl font-extrabold text-ink">{value}</div>
                <div className="text-xs text-ink-muted font-medium">{label}</div>
              </div>
            </div>
          ))}
        </div>

        {/* ── Charts ────────────────────────────── */}
        {employees.length > 0 && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <div className="card p-5 lg:col-span-2">
              <div className="mb-4">
                <h3 className="text-sm font-bold text-ink">Headcount by Department</h3>
                <p className="text-xs text-ink-muted">Number of employees per department</p>
              </div>
              <ResponsiveContainer width="100%" height={180}>
                <BarChart data={deptChartData} margin={{ top: 4, right: 4, bottom: 0, left: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="dept" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                  <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} width={24} />
                  <Tooltip
                    formatter={(v: number, name: string) => [name === 'count' ? `${v} employees` : fmtRwf(v), name === 'count' ? 'Headcount' : 'Payroll']}
                    contentStyle={{ borderRadius: 10, border: '1px solid #e2e8f0', fontSize: 12 }}
                  />
                  <Bar dataKey="count" name="count" fill="#f97316" radius={[5, 5, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="card p-5">
              <div className="mb-4">
                <h3 className="text-sm font-bold text-ink">Employment Status</h3>
                <p className="text-xs text-ink-muted">Active vs inactive workforce</p>
              </div>
              <div className="flex flex-col items-center">
                <ResponsiveContainer width="100%" height={140}>
                  <PieChart>
                    <Pie data={statusPieData} cx="50%" cy="50%" innerRadius={40} outerRadius={65} dataKey="value" paddingAngle={3}>
                      {statusPieData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                    </Pie>
                    <Tooltip formatter={(v: number, name: string) => [`${v} employees`, name]} contentStyle={{ borderRadius: 10, border: '1px solid #e2e8f0', fontSize: 12 }} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="flex gap-4 mt-1">
                  {statusPieData.map(d => (
                    <div key={d.name} className="flex items-center gap-1.5 text-xs text-ink-muted">
                      <span className={clsx('w-2.5 h-2.5 rounded-full shrink-0', d.dotClass)} />
                      {d.name}: <span className="font-semibold text-ink">{d.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── Salary summary ────────────────────── */}
        {employees.length > 0 && (
          <div className="card p-4">
            <div className="flex items-center justify-between flex-wrap gap-3">
              <div>
                <h3 className="text-sm font-semibold text-ink">Total Monthly Payroll</h3>
                <p className="text-xs text-ink-muted">Gross salary across all active employees</p>
              </div>
              <div className="text-xl font-extrabold text-orange-600">{fmtRwf(totalPayroll)}</div>
            </div>
            {deptChartData.length > 0 && (
              <div className="mt-3 space-y-1.5">
                {deptChartData.map((d, i) => (
                  <div key={d.dept} className="flex items-center gap-2">
                    <span className="text-xs text-ink-muted w-24 truncate shrink-0">{d.dept}</span>
                    <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className={clsx('h-2 rounded-full transition-all', BAR_TAILWIND[i % BAR_TAILWIND.length])}
                        style={{ width: `${totalPayroll > 0 ? (d.payroll / totalPayroll) * 100 : 0}%` }}
                      />
                    </div>
                    <span className="text-xs font-medium text-ink w-20 text-right shrink-0">{fmtRwfShort(d.payroll)}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── Tabs ─────────────────────────────── */}
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="flex bg-slate-100 rounded-xl p-1 gap-1">
            {(['employees', 'payroll'] as const).map(t => (
              <button key={t} type="button" onClick={() => setTab(t)}
                className={clsx('px-4 py-1.5 rounded-lg text-sm font-medium transition-all',
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
                <button type="button" onClick={() => refetchEmp()} aria-label="Refresh employees" className="btn-ghost">
                  <RefreshCw className={clsx('w-4 h-4', empLoading && 'animate-spin')} />
                </button>
                <button type="button" onClick={() => setShowAddEmp(true)} className="btn-primary gap-2">
                  <Plus className="w-4 h-4" />Add Employee
                </button>
              </>
            ) : (
              <button type="button" onClick={() => setShowCreatePayroll(true)} className="btn-primary gap-2">
                <Plus className="w-4 h-4" />New Payroll Run
              </button>
            )}
          </div>
        </div>

        {/* ── Employees table ───────────────────── */}
        {tab === 'employees' && (
          <div className="card overflow-hidden">
            <table className="table">
              <thead>
                <tr>
                  <th>Employee</th>
                  <th>Department</th>
                  <th>Position</th>
                  <th className="text-right">Gross Salary</th>
                  <th>Status</th>
                  <th>Hired</th>
                  <th className="text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {empLoading ? (
                  <tr><td colSpan={7} className="text-center py-12"><Loader2 className="w-6 h-6 animate-spin mx-auto text-ink-muted" /></td></tr>
                ) : employees.length === 0 ? (
                  <tr><td colSpan={7} className="text-center py-12 text-ink-muted">
                    <Users className="w-10 h-10 mx-auto mb-2 opacity-30" />
                    <p className="text-sm">No employees found</p>
                  </td></tr>
                ) : employees.map(emp => (
                  <tr key={emp.id}>
                    <td>
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center text-orange-700 font-bold text-xs shrink-0">
                          {emp.name?.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <div className="font-semibold text-ink">{emp.name}</div>
                          <div className="text-xs text-ink-muted">{emp.email}</div>
                        </div>
                      </div>
                    </td>
                    <td><span className="text-sm text-ink-secondary">{emp.department || '—'}</span></td>
                    <td><span className="text-sm text-ink-secondary">{emp.position || '—'}</span></td>
                    <td className="text-right"><span className="font-semibold text-ink">{fmtRwf(emp.salary)}</span></td>
                    <td>
                      <span className={emp.status === 'active' ? 'badge badge-green' : 'badge badge-gray'}>
                        {emp.status === 'active' ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="text-ink-muted text-sm">{emp.hire_date ? fmtDate(emp.hire_date) : '—'}</td>
                    <td>
                      <div className="flex items-center justify-end gap-1.5">
                        <ActionBtn variant="view"   label="View"   icon={Eye}    onClick={() => setViewEmp(emp)} />
                        <ActionBtn variant="edit"   label="Edit"   icon={Edit2}  onClick={() => setEditEmp(emp)} />
                        <ActionBtn variant="delete" label="Remove" icon={Trash2} onClick={() => setDeleteEmp(emp)} />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* ── Payroll runs ──────────────────────── */}
        {tab === 'payroll' && (
          <div className="space-y-3">
            {payrollLoading ? (
              <div className="flex justify-center py-12"><Loader2 className="w-6 h-6 animate-spin text-ink-muted" /></div>
            ) : payrollRuns.length === 0 ? (
              <div className="card text-center py-12 text-ink-muted">
                <DollarSign className="w-10 h-10 mx-auto mb-2 opacity-30" />
                <p className="text-sm">No payroll runs yet</p>
              </div>
            ) : payrollRuns.map(run => (
              <div key={run.id} className="card overflow-hidden">
                <div className="p-5 flex items-center justify-between flex-wrap gap-3">
                  <div>
                    <div className="flex items-center gap-2 mb-1.5">
                      <span className={clsx('badge', PAYROLL_COLORS[run.status] ?? 'badge-gray')}>
                        {run.status.charAt(0).toUpperCase() + run.status.slice(1)}
                      </span>
                      <span className="text-sm text-ink-muted">{fmtDate(run.period_start)} → {fmtDate(run.period_end)}</span>
                    </div>
                    <div className="flex flex-wrap gap-4 text-sm">
                      <span className="text-ink-muted">{run.employee_count} employees</span>
                      <span className="text-ink">Gross: <strong>{fmtRwf(run.total_gross)}</strong></span>
                      <span className="text-orange-600">Net: <strong>{fmtRwf(run.total_net)}</strong></span>
                    </div>
                  </div>
                  <div className="flex gap-1.5 flex-wrap">
                    <ActionBtn variant="view" label="View" icon={Eye} onClick={() => setViewRun(run)} />
                    {run.status === 'draft' && (
                      <button type="button" onClick={() => processMutation.mutate(run.id)} disabled={processMutation.isPending}
                        className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs font-medium text-slate-600 hover:text-blue-700 hover:bg-blue-50 hover:border-blue-200 transition-all disabled:opacity-50">
                        {processMutation.isPending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Play className="w-3.5 h-3.5" />}Process
                      </button>
                    )}
                    {run.status === 'processed' && (
                      <button type="button" onClick={() => approveMutation.mutate(run.id)} disabled={approveMutation.isPending}
                        className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-orange-500 hover:bg-orange-400 text-white text-xs font-semibold transition-all disabled:opacity-50">
                        {approveMutation.isPending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <CheckCircle className="w-3.5 h-3.5" />}Approve
                      </button>
                    )}
                    <button type="button"
                      onClick={() => setExpandedRun(expandedRun === run.id ? null : run.id)}
                      className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-all">
                      <FileText className="w-3.5 h-3.5" />Pay Slips
                    </button>
                    <ActionBtn variant="delete" label="Delete" icon={Trash2} onClick={() => setDeleteRun(run)} />
                  </div>
                </div>
                {expandedRun === run.id && (
                  <div className="border-t border-slate-100">
                    <table className="table">
                      <thead>
                        <tr>
                          <th>Employee</th>
                          <th className="text-right">Gross Salary</th>
                          <th className="text-right">Tax Deduction</th>
                          <th className="text-right">Net Pay</th>
                        </tr>
                      </thead>
                      <tbody>
                        {paySlips.map((slip: Record<string, unknown>) => (
                          <tr key={String(slip.id)}>
                            <td className="font-medium text-ink">{String(slip.employee_name ?? '—')}</td>
                            <td className="text-right text-ink-secondary">{fmtRwf(Number(slip.gross_salary ?? 0))}</td>
                            <td className="text-right text-red-500">{fmtRwf(Number(slip.tax_deduction ?? 0))}</td>
                            <td className="text-right font-bold text-orange-600">{fmtRwf(Number(slip.net_salary ?? 0))}</td>
                          </tr>
                        ))}
                        {paySlips.length === 0 && (
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

      {/* ── Modals ──────────────────────────────────────────────── */}
      {viewEmp && (
        <ViewEmployeeModal
          emp={viewEmp}
          onClose={() => setViewEmp(null)}
          onEdit={() => { setEditEmp(viewEmp); setViewEmp(null) }}
        />
      )}
      {editEmp && <EditEmployeeModal emp={editEmp} onClose={() => setEditEmp(null)} />}
      {deleteEmp && (
        <DeleteConfirmModal
          title={`Remove ${deleteEmp.name}?`}
          description="This will permanently remove the employee and their records."
          isPending={deleteEmpMutation.isPending}
          onConfirm={() => deleteEmpMutation.mutate(deleteEmp.id)}
          onClose={() => setDeleteEmp(null)}
        />
      )}
      {viewRun && (
        <ViewPayrollModal
          run={viewRun}
          paySlips={paySlips}
          onClose={() => setViewRun(null)}
        />
      )}
      {deleteRun && (
        <DeleteConfirmModal
          title="Delete Payroll Run?"
          description={`Run for ${fmtDate(deleteRun.period_start)} → ${fmtDate(deleteRun.period_end)} will be permanently deleted.`}
          isPending={deleteRunMutation.isPending}
          onConfirm={() => deleteRunMutation.mutate(deleteRun.id)}
          onClose={() => setDeleteRun(null)}
        />
      )}
      {showAddEmp && <AddEmployeeModal onClose={() => setShowAddEmp(false)} />}
      {showCreatePayroll && <CreatePayrollModal onClose={() => setShowCreatePayroll(false)} />}
    </div>
  )
}
