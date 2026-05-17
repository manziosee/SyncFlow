'use client'

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Plus, Search, Filter, Eye, CheckCircle, XCircle, FileText, RefreshCw, Loader2 } from 'lucide-react'
import { invoicesApi } from '@/lib/api'
import Topbar from '@/components/layout/Topbar'
import Link from 'next/link'
import toast from 'react-hot-toast'
import clsx from 'clsx'

const STATUS_COLORS: Record<string, string> = {
  draft: 'badge-gray',
  submitted: 'badge-blue',
  approved: 'badge-green',
  rejected: 'badge-red',
  paid: 'badge-green',
  overdue: 'badge-red',
  void: 'badge-gray',
}

const fmtRwf = (n: number) =>
  new Intl.NumberFormat('en-RW', { maximumFractionDigits: 0 }).format(n) + ' RWF'

const fmtDate = (d: string) =>
  new Date(d).toLocaleDateString('en-RW', { day: '2-digit', month: 'short', year: 'numeric' })

interface InvoiceFormData {
  customer_name: string
  customer_email: string
  due_date: string
  line_items: { description: string; quantity: number; unit_price: number }[]
  notes: string
}

function CreateInvoiceModal({ onClose }: { onClose: () => void }) {
  const qc = useQueryClient()
  const [form, setForm] = useState<InvoiceFormData>({
    customer_name: '',
    customer_email: '',
    due_date: '',
    line_items: [{ description: '', quantity: 1, unit_price: 0 }],
    notes: '',
  })

  const mutation = useMutation({
    mutationFn: (data: Record<string, unknown>) => invoicesApi.create(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['invoices'] })
      toast.success('Invoice created')
      onClose()
    },
    onError: () => toast.error('Failed to create invoice'),
  })

  const total = form.line_items.reduce((s, i) => s + i.quantity * i.unit_price, 0)

  const addLine = () => setForm(f => ({ ...f, line_items: [...f.line_items, { description: '', quantity: 1, unit_price: 0 }] }))
  const updateLine = (idx: number, field: string, value: string | number) =>
    setForm(f => ({ ...f, line_items: f.line_items.map((l, i) => i === idx ? { ...l, [field]: value } : l) }))
  const removeLine = (idx: number) =>
    setForm(f => ({ ...f, line_items: f.line_items.filter((_, i) => i !== idx) }))

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    mutation.mutate({ ...form, total_amount: total })
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-slate-100">
          <h2 className="text-lg font-bold text-ink">New Invoice</h2>
          <button onClick={onClose} className="text-ink-muted hover:text-ink transition-colors">
            <XCircle className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
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

          {/* Line items */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-medium text-ink-secondary">Line Items</label>
              <button type="button" onClick={addLine} className="text-xs text-primary-600 hover:text-primary-700 font-medium">+ Add line</button>
            </div>
            <div className="space-y-2">
              {form.line_items.map((item, idx) => (
                <div key={idx} className="flex gap-2 items-center">
                  <input className="input flex-1" placeholder="Description" value={item.description}
                    onChange={e => updateLine(idx, 'description', e.target.value)} required />
                  <input className="input w-20" type="number" min="1" placeholder="Qty" value={item.quantity}
                    onChange={e => updateLine(idx, 'quantity', Number(e.target.value))} />
                  <input className="input w-28" type="number" min="0" placeholder="Unit price" value={item.unit_price}
                    onChange={e => updateLine(idx, 'unit_price', Number(e.target.value))} />
                  {form.line_items.length > 1 && (
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

  const approveMutation = useMutation({
    mutationFn: (id: string) => invoicesApi.approve(id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['invoices'] }); toast.success('Invoice approved') },
    onError: () => toast.error('Failed to approve'),
  })

  const invoices: Record<string, unknown>[] = data?.data ?? data ?? []

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <Topbar title="Invoices" subtitle={`${invoices.length} records`} />

      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        {/* Toolbar */}
        <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
          <div className="flex gap-2 flex-1 max-w-md">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-muted" />
              <input
                className="input pl-9"
                placeholder="Search invoices…"
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>
            <select
              className="input w-36"
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
            >
              <option value="">All status</option>
              {['draft', 'submitted', 'approved', 'paid', 'overdue', 'rejected', 'void'].map(s => (
                <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
              ))}
            </select>
          </div>
          <div className="flex gap-2">
            <button onClick={() => refetch()} className="btn-ghost gap-1.5">
              <RefreshCw className={clsx('w-4 h-4', isLoading && 'animate-spin')} />
            </button>
            <button onClick={() => setShowCreate(true)} className="btn-primary gap-2">
              <Plus className="w-4 h-4" />
              New Invoice
            </button>
          </div>
        </div>

        {/* Stats bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: 'Draft', color: 'text-ink-muted', filter: 'draft' },
            { label: 'Pending', color: 'text-warning', filter: 'submitted' },
            { label: 'Paid', color: 'text-success', filter: 'paid' },
            { label: 'Overdue', color: 'text-danger', filter: 'overdue' },
          ].map(({ label, color, filter }) => (
            <button
              key={label}
              onClick={() => setStatusFilter(statusFilter === filter ? '' : filter)}
              className={clsx('card p-3 text-left transition-all', statusFilter === filter && 'ring-2 ring-primary-500')}
            >
              <div className={clsx('text-lg font-bold', color)}>
                {invoices.filter((i: Record<string, unknown>) => i.status === filter).length}
              </div>
              <div className="text-xs text-ink-muted">{label}</div>
            </button>
          ))}
        </div>

        {/* Table */}
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="table">
              <thead>
                <tr>
                  <th>Invoice #</th>
                  <th>Customer</th>
                  <th>Amount</th>
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
                    No invoices found
                  </td></tr>
                ) : invoices.map((inv: Record<string, unknown>) => (
                  <tr key={String(inv.id)}>
                    <td className="font-mono text-sm font-medium text-ink">{String(inv.number ?? inv.id).slice(0, 8)}</td>
                    <td>
                      <div className="font-medium text-ink">{String(inv.customer_name ?? '—')}</div>
                      <div className="text-xs text-ink-muted">{String(inv.customer_email ?? '')}</div>
                    </td>
                    <td className="font-semibold text-ink">{fmtRwf(Number(inv.total_amount ?? 0))}</td>
                    <td className="text-ink-secondary text-sm">{inv.due_date ? fmtDate(String(inv.due_date)) : '—'}</td>
                    <td>
                      <span className={STATUS_COLORS[String(inv.status)] ?? 'badge-gray'}>
                        {String(inv.status)}
                      </span>
                    </td>
                    <td>
                      <div className="flex items-center justify-end gap-1">
                        <Link href={`/invoices/${inv.id}`} className="btn-ghost p-1.5" title="View">
                          <Eye className="w-4 h-4" />
                        </Link>
                        {inv.status === 'submitted' && (
                          <button
                            onClick={() => approveMutation.mutate(String(inv.id))}
                            disabled={approveMutation.isPending}
                            className="btn-ghost p-1.5 text-success hover:bg-success-bg"
                            title="Approve"
                          >
                            <CheckCircle className="w-4 h-4" />
                          </button>
                        )}
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
