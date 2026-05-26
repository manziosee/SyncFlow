'use client'

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  Plus, Search, Eye, CheckCircle, XCircle, FileText,
  RefreshCw, Loader2, Edit2, Trash2, TrendingUp,
} from 'lucide-react'
import { invoicesApi, crmApi } from '@/lib/api'
import PageHeroHeader, { HeroButton } from '@/components/dashboard/PageHeroHeader'
import Link from 'next/link'
import toast from 'react-hot-toast'
import clsx from 'clsx'
import {
  AreaChart, Area, BarChart, Bar,
  XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
} from 'recharts'

const STATUS_COLORS: Record<string, string> = {
  draft: 'badge-gray',
  pending_approval: 'badge-blue',
  approved: 'badge-green',
  rejected: 'badge-red',
  paid: 'badge-green',
  voided: 'badge-gray',
  void: 'badge-gray',
}

const STATUS_ORDER = ['draft', 'pending_approval', 'approved', 'paid', 'rejected', 'voided']

const fmtRwf = (n: number) =>
  new Intl.NumberFormat('en-RW', { maximumFractionDigits: 0 }).format(n) + ' RWF'

const fmtRwfShort = (n: number) => {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + 'M'
  if (n >= 1_000) return (n / 1_000).toFixed(0) + 'K'
  return String(n)
}

const fmtDate = (d: string) =>
  new Date(d).toLocaleDateString('en-RW', { day: '2-digit', month: 'short', year: 'numeric' })

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

interface InvoiceFormData {
  customer_id: string
  customer_name: string
  customer_email: string
  due_date: string
  lines: { description: string; quantity: number; unit_price: number }[]
  notes: string
}

interface CrmCustomer {
  id: string
  name: string
  email?: string
  company?: string
}

function ActionBtn({
  onClick, variant = 'view', label, icon: Icon, disabled,
}: {
  onClick?: () => void
  variant?: 'view' | 'edit' | 'approve' | 'delete'
  label: string
  icon: React.ElementType
  disabled?: boolean
}) {
  const styles = {
    view:    'text-slate-500 hover:text-blue-700 hover:bg-blue-50 border-slate-200 hover:border-blue-200',
    edit:    'text-slate-500 hover:text-orange-700 hover:bg-orange-50 border-slate-200 hover:border-orange-200',
    approve: 'text-slate-500 hover:text-emerald-700 hover:bg-emerald-50 border-slate-200 hover:border-emerald-200',
    delete:  'text-slate-500 hover:text-red-700 hover:bg-red-50 border-slate-200 hover:border-red-200',
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

function CreateInvoiceModal({ onClose }: { onClose: () => void }) {
  const qc = useQueryClient()
  const [form, setForm] = useState<InvoiceFormData>({
    customer_id: '',
    customer_name: '',
    customer_email: '',
    due_date: '',
    lines: [{ description: '', quantity: 1, unit_price: 0 }],
    notes: '',
  })
  const [customerSearch, setCustomerSearch] = useState('')

  const { data: customersData } = useQuery({
    queryKey: ['crm-customers-picker', customerSearch],
    queryFn: () => crmApi.customers(customerSearch ? { search: customerSearch } : undefined)
      .then(r => (r.data?.data ?? r.data ?? []) as CrmCustomer[]),
  })
  const crmCustomers: CrmCustomer[] = customersData ?? []

  const mutation = useMutation({
    mutationFn: (data: Record<string, unknown>) => invoicesApi.create(data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['invoices'] }); toast.success('Invoice created'); onClose() },
    onError: () => toast.error('Failed to create invoice'),
  })

  const total = form.lines.reduce((s, i) => s + i.quantity * i.unit_price, 0)
  const addLine = () => setForm(f => ({ ...f, lines: [...f.lines, { description: '', quantity: 1, unit_price: 0 }] }))
  const updateLine = (idx: number, field: string, value: string | number) =>
    setForm(f => ({ ...f, lines: f.lines.map((l, i) => i === idx ? { ...l, [field]: value } : l) }))
  const removeLine = (idx: number) =>
    setForm(f => ({ ...f, lines: f.lines.filter((_, i) => i !== idx) }))

  const pickCustomer = (c: CrmCustomer) => {
    setForm(f => ({ ...f, customer_id: c.id, customer_name: c.name, customer_email: c.email ?? '' }))
    setCustomerSearch('')
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-slate-100">
          <h2 className="text-lg font-bold text-ink">New Invoice</h2>
          <button type="button" onClick={onClose} className="text-ink-muted hover:text-ink transition-colors">
            <XCircle className="w-5 h-5" />
          </button>
        </div>
        <form onSubmit={e => { e.preventDefault(); mutation.mutate({ ...form, total_amount: total }) }} className="p-6 space-y-4">
          {/* CRM customer picker */}
          <div>
            <label className="block text-xs font-medium text-ink-secondary mb-1">Pick from CRM (optional)</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-muted" />
              <input
                className="input pl-9"
                placeholder="Search existing customers…"
                value={customerSearch}
                onChange={e => setCustomerSearch(e.target.value)}
              />
            </div>
            {customerSearch && crmCustomers.length > 0 && (
              <div className="mt-1 border border-slate-200 rounded-xl overflow-hidden shadow-lg max-h-36 overflow-y-auto">
                {crmCustomers.slice(0, 8).map(c => (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => pickCustomer(c)}
                    className="w-full text-left px-3 py-2 hover:bg-orange-50 transition-colors flex items-center justify-between gap-2"
                  >
                    <div>
                      <span className="text-sm font-medium text-ink">{c.name}</span>
                      {c.company && <span className="text-xs text-ink-muted ml-1.5">· {c.company}</span>}
                    </div>
                    {c.email && <span className="text-xs text-ink-muted">{c.email}</span>}
                  </button>
                ))}
              </div>
            )}
            {form.customer_id && (
              <div className="mt-1.5 flex items-center gap-2 text-xs text-emerald-700 bg-emerald-50 rounded-lg px-3 py-1.5">
                <CheckCircle className="w-3.5 h-3.5 shrink-0" />
                Linked to CRM customer
                <button type="button" className="ml-auto text-ink-muted hover:text-red-500" onClick={() => setForm(f => ({ ...f, customer_id: '' }))}>×</button>
              </div>
            )}
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-ink-secondary mb-1">Customer Name</label>
              <input className="input" value={form.customer_name} onChange={e => setForm(f => ({ ...f, customer_name: e.target.value }))} placeholder="Acme Corp" required />
            </div>
            <div>
              <label className="block text-xs font-medium text-ink-secondary mb-1">Customer Email</label>
              <input className="input" type="email" value={form.customer_email} onChange={e => setForm(f => ({ ...f, customer_email: e.target.value }))} placeholder="billing@acme.com" />
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-ink-secondary mb-1">Due Date</label>
            <input className="input" type="date" value={form.due_date} onChange={e => setForm(f => ({ ...f, due_date: e.target.value }))} required />
          </div>
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-medium text-ink-secondary">Line Items</label>
              <button type="button" onClick={addLine} className="text-xs text-orange-600 hover:text-orange-700 font-medium">+ Add line</button>
            </div>
            <div className="space-y-2">
              {form.lines.map((item, idx) => (
                <div key={idx} className="flex gap-2 items-center">
                  <input className="input flex-1" placeholder="Description" value={item.description} onChange={e => updateLine(idx, 'description', e.target.value)} required />
                  <input className="input w-20" type="number" min="1" placeholder="Qty" value={item.quantity} onChange={e => updateLine(idx, 'quantity', Number(e.target.value))} />
                  <input className="input w-28" type="number" min="0" placeholder="Unit price" value={item.unit_price} onChange={e => updateLine(idx, 'unit_price', Number(e.target.value))} />
                  {form.lines.length > 1 && (
                    <button type="button" onClick={() => removeLine(idx)} className="text-ink-muted hover:text-danger transition-colors shrink-0">
                      <XCircle className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-ink-secondary mb-1">Notes</label>
            <textarea className="input" rows={2} value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} placeholder="Payment terms, bank details…" />
          </div>
          <div className="flex items-center justify-between pt-4 border-t border-slate-100">
            <div>
              <span className="text-sm text-ink-muted">Total: </span>
              <span className="font-bold text-lg text-ink">{fmtRwf(total)}</span>
            </div>
            <div className="flex gap-2">
              <button type="button" onClick={onClose} className="btn-ghost">Cancel</button>
              <button type="submit" disabled={mutation.isPending} className="btn-primary gap-2">
                {mutation.isPending && <Loader2 className="w-4 h-4 animate-spin" />}
                Create Invoice
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}

export default function InvoicesPage() {
  const qc = useQueryClient()
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [showCreate, setShowCreate] = useState(false)

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['invoices', search, statusFilter],
    queryFn: () => invoicesApi.list({ search, status: statusFilter || undefined }).then(r => r.data),
  })

  const { data: revenueData } = useQuery({
    queryKey: ['revenue-monthly'],
    queryFn: () => invoicesApi.revenueByMonth(new Date().getFullYear()).then(r => r.data?.data ?? r.data ?? []),
  })

  const approveMutation = useMutation({
    mutationFn: (id: string) => invoicesApi.approve(id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['invoices'] }); toast.success('Invoice approved') },
    onError: () => toast.error('Failed to approve'),
  })

  const invoices: Record<string, unknown>[] = data?.data ?? data ?? []

  const statusChartData = STATUS_ORDER.map(s => ({
    status: s.charAt(0).toUpperCase() + s.slice(1),
    count: invoices.filter(i => i.status === s).length,
    amount: invoices.filter(i => i.status === s).reduce((sum, i) => sum + Number(i.total_amount ?? 0), 0),
  })).filter(d => d.count > 0)

  const monthlyData = MONTHS.map((name, idx) => {
    const apiEntry = Array.isArray(revenueData)
      ? revenueData.find((r: Record<string, unknown>) => Number(r.month) === idx + 1)
      : null
    return {
      name,
      revenue: apiEntry ? Number(apiEntry.amount ?? apiEntry.revenue ?? 0) : 0,
    }
  })

  const totalRevenue = invoices.filter(i => i.status === 'paid').reduce((s, i) => s + Number(i.total_amount ?? 0), 0)
  const pendingAmount = invoices.filter(i => i.status === 'pending_approval').reduce((s, i) => s + Number(i.total_amount ?? 0), 0)

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <PageHeroHeader
        title="Invoices"
        highlight="Invoices"
        subtitle={`${invoices.length} records · Track, approve and manage all billing`}
        imageIndex={0}
        actions={
          <>
            <HeroButton variant="ghost" onClick={() => refetch()}>
              <RefreshCw className={clsx('w-3.5 h-3.5', isLoading && 'animate-spin')} />
            </HeroButton>
            <HeroButton variant="orange" onClick={() => setShowCreate(true)}>
              <Plus className="w-3.5 h-3.5" />
              New Invoice
            </HeroButton>
          </>
        }
      />

      <div className="flex-1 overflow-y-auto p-6 space-y-5">

        {/* ── Summary KPI cards ─────────────────── */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: 'Draft',          value: invoices.filter(i => i.status === 'draft').length,              color: 'text-slate-500',    filter: 'draft' },
            { label: 'Pending Review', value: invoices.filter(i => i.status === 'pending_approval').length,   color: 'text-blue-600',     filter: 'pending_approval' },
            { label: 'Paid',           value: invoices.filter(i => i.status === 'paid').length,               color: 'text-emerald-600',  filter: 'paid' },
            { label: 'Approved',       value: invoices.filter(i => i.status === 'approved').length,           color: 'text-green-600',    filter: 'approved' },
          ].map(({ label, value, color, filter }) => (
            <button
              key={label}
              type="button"
              onClick={() => setStatusFilter(statusFilter === filter ? '' : filter)}
              className={clsx(
                'card p-4 text-left transition-all hover:-translate-y-0.5',
                statusFilter === filter && 'ring-2 ring-orange-400',
              )}
            >
              <div className={clsx('text-2xl font-extrabold', color)}>{value}</div>
              <div className="text-xs text-ink-muted font-medium mt-0.5">{label}</div>
            </button>
          ))}
        </div>

        {/* ── Charts row ───────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

          {/* Monthly revenue trend */}
          <div className="card p-5">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-bold text-ink">Monthly Revenue</h3>
                <p className="text-xs text-ink-muted">Paid invoices by month — current year</p>
              </div>
              <div className="flex items-center gap-1.5 bg-emerald-50 text-emerald-700 text-xs font-semibold px-2.5 py-1 rounded-lg">
                <TrendingUp className="w-3.5 h-3.5" />
                {fmtRwfShort(totalRevenue)} total
              </div>
            </div>
            <ResponsiveContainer width="100%" height={180}>
              <AreaChart data={monthlyData} margin={{ top: 4, right: 4, bottom: 0, left: 0 }}>
                <defs>
                  <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f97316" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#f97316" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                <YAxis tickFormatter={fmtRwfShort} tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} width={40} />
                <Tooltip
                  formatter={(v: number) => [fmtRwf(v), 'Revenue']}
                  contentStyle={{ borderRadius: 10, border: '1px solid #e2e8f0', fontSize: 12 }}
                />
                <Area type="monotone" dataKey="revenue" stroke="#f97316" strokeWidth={2} fill="url(#revGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Status distribution */}
          <div className="card p-5">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-bold text-ink">Invoice Status Breakdown</h3>
                <p className="text-xs text-ink-muted">Count of invoices per status</p>
              </div>
              <div className="text-xs text-ink-muted bg-slate-50 px-2.5 py-1 rounded-lg font-medium">
                {fmtRwfShort(pendingAmount)} pending
              </div>
            </div>
            {statusChartData.length === 0 ? (
              <div className="h-[180px] flex items-center justify-center text-ink-muted text-sm">
                <FileText className="w-8 h-8 mr-2 opacity-30" />No data yet
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={180}>
                <BarChart data={statusChartData} margin={{ top: 4, right: 4, bottom: 0, left: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="status" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                  <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} width={24} />
                  <Tooltip
                    formatter={(v: number, name: string) => [name === 'count' ? `${v} invoices` : fmtRwf(v), name === 'count' ? 'Count' : 'Amount']}
                    contentStyle={{ borderRadius: 10, border: '1px solid #e2e8f0', fontSize: 12 }}
                  />
                  <Bar dataKey="count" fill="#f97316" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* ── Search + filter toolbar ───────────── */}
        <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-muted" />
            <input className="input pl-9" placeholder="Search by customer or invoice #…" value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <select aria-label="Filter by status" className="input w-40" value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
            <option value="">All statuses</option>
            {['draft', 'pending_approval', 'approved', 'paid', 'rejected', 'voided'].map(s => (
              <option key={s} value={s}>{s === 'pending_approval' ? 'Pending Review' : s.charAt(0).toUpperCase() + s.slice(1)}</option>
            ))}
          </select>
        </div>

        {/* ── Table ────────────────────────────── */}
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="table">
              <thead>
                <tr>
                  <th>Invoice #</th>
                  <th>Customer</th>
                  <th className="text-right">Amount</th>
                  <th>Due Date</th>
                  <th>Status</th>
                  <th className="text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <tr><td colSpan={6} className="text-center py-12 text-ink-muted">
                    <Loader2 className="w-6 h-6 animate-spin mx-auto" />
                  </td></tr>
                ) : invoices.length === 0 ? (
                  <tr><td colSpan={6} className="text-center py-12 text-ink-muted">
                    <FileText className="w-10 h-10 mx-auto mb-2 opacity-30" />
                    <p className="text-sm">No invoices found</p>
                    <p className="text-xs mt-1">Create your first invoice to get started</p>
                  </td></tr>
                ) : invoices.map((inv: Record<string, unknown>) => (
                  <tr key={String(inv.id)}>
                    <td className="font-mono text-sm font-semibold text-ink">
                      #{String(inv.number ?? inv.id).slice(0, 8).toUpperCase()}
                    </td>
                    <td>
                      <div className="font-medium text-ink">{String(inv.customer_name ?? '—')}</div>
                      <div className="text-xs text-ink-muted">{String(inv.customer_email ?? '')}</div>
                    </td>
                    <td className="text-right">
                      <div className="font-bold text-ink">{fmtRwf(Number(inv.total_amount ?? 0))}</div>
                    </td>
                    <td className="text-ink-secondary text-sm">
                      {inv.due_date ? fmtDate(String(inv.due_date)) : '—'}
                    </td>
                    <td>
                      <span className={clsx('badge', STATUS_COLORS[String(inv.status)] ?? 'badge-gray')}>
                        {String(inv.status).charAt(0).toUpperCase() + String(inv.status).slice(1)}
                      </span>
                    </td>
                    <td>
                      <div className="flex items-center justify-end gap-1.5">
                        <ActionBtn
                          variant="view"
                          label="View"
                          icon={Eye}
                          onClick={() => {}}
                        />
                        <Link href={`/invoices/${inv.id}`} className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border text-xs font-medium border-slate-200 text-slate-500 hover:text-orange-700 hover:bg-orange-50 hover:border-orange-200 transition-all">
                          <Edit2 className="w-3.5 h-3.5" />Edit
                        </Link>
                        {inv.status === 'pending_approval' && (
                          <ActionBtn
                            variant="approve"
                            label="Approve"
                            icon={CheckCircle}
                            disabled={approveMutation.isPending}
                            onClick={() => approveMutation.mutate(String(inv.id))}
                          />
                        )}
                        <ActionBtn
                          variant="delete"
                          label="Delete"
                          icon={Trash2}
                          onClick={() => toast.error('Delete not yet supported by the server')}
                        />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      </div>

      {showCreate && <CreateInvoiceModal onClose={() => setShowCreate(false)} />}
    </div>
  )
}
