'use client'

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { crmApi } from '@/lib/api'
import PageHeroHeader, { HeroButton } from '@/components/dashboard/PageHeroHeader'
import {
  ShoppingCart, MessageSquare, Plus, Search,
  Loader2, RefreshCw, X, User, Globe, Phone, Mail
} from 'lucide-react'
import toast from 'react-hot-toast'
import clsx from 'clsx'

const fmtDate = (d: string) =>
  new Date(d).toLocaleDateString('en-RW', { day: '2-digit', month: 'short', year: 'numeric' })

const STATUS_COLORS: Record<string, string> = {
  active: 'badge-green',
  inactive: 'badge-gray',
  prospect: 'badge-blue',
  churned: 'badge-red',
}

interface Customer {
  id: string
  name: string
  email: string
  phone?: string
  country?: string
  status: string
  industry?: string
  inserted_at?: string
}

interface Interaction {
  id: string
  type: string
  notes: string
  inserted_at: string
  user_name?: string
}

function AddCustomerModal({ onClose }: { onClose: () => void }) {
  const qc = useQueryClient()
  const [form, setForm] = useState({
    name: '', email: '', phone: '', country: 'Rwanda',
    industry: '', status: 'prospect'
  })

  const mutation = useMutation({
    mutationFn: () => crmApi.createCustomer(form as Record<string, unknown>),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['customers'] }); toast.success('Customer added'); onClose() },
    onError: () => toast.error('Failed to add customer'),
  })

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-ink">Add Customer</h3>
          <button onClick={onClose} className="text-ink-muted hover:text-ink"><X className="w-4 h-4" /></button>
        </div>
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-ink-secondary mb-1">Company / Name</label>
              <input className="input" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="Acme Ltd" required />
            </div>
            <div>
              <label className="block text-xs font-medium text-ink-secondary mb-1">Email</label>
              <input className="input" type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} placeholder="contact@acme.com" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-ink-secondary mb-1">Phone</label>
              <input className="input" value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} placeholder="+250 788 000 000" />
            </div>
            <div>
              <label className="block text-xs font-medium text-ink-secondary mb-1">Country</label>
              <input className="input" value={form.country} onChange={e => setForm(f => ({ ...f, country: e.target.value }))} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-ink-secondary mb-1">Industry</label>
              <input className="input" value={form.industry} onChange={e => setForm(f => ({ ...f, industry: e.target.value }))} placeholder="Technology" />
            </div>
            <div>
              <label className="block text-xs font-medium text-ink-secondary mb-1">Status</label>
              <select className="input" value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value }))}>
                {['prospect', 'active', 'inactive', 'churned'].map(s => (
                  <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
                ))}
              </select>
            </div>
          </div>
        </div>
        <div className="flex gap-2 mt-4">
          <button onClick={onClose} className="btn-ghost flex-1">Cancel</button>
          <button onClick={() => mutation.mutate()} disabled={!form.name || mutation.isPending} className="btn-primary flex-1 gap-2">
            {mutation.isPending && <Loader2 className="w-4 h-4 animate-spin" />}
            Add Customer
          </button>
        </div>
      </div>
    </div>
  )
}

function CustomerDetailPanel({ customer, onClose }: { customer: Customer; onClose: () => void }) {
  const qc = useQueryClient()
  const [note, setNote] = useState('')
  const [interactionType, setInteractionType] = useState('call')

  const { data: interactions = [] } = useQuery({
    queryKey: ['interactions', customer.id],
    queryFn: () => crmApi.interactions(customer.id).then(r => r.data?.data ?? r.data ?? []),
  })

  const mutation = useMutation({
    mutationFn: () => crmApi.recordInteraction(customer.id, { type: interactionType, notes: note }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['interactions', customer.id] })
      toast.success('Interaction recorded')
      setNote('')
    },
    onError: () => toast.error('Failed to record interaction'),
  })

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[85vh] flex flex-col">
        {/* Header */}
        <div className="flex items-start gap-3 p-6 border-b border-slate-100">
          <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center text-primary-700 font-bold text-lg shrink-0">
            {customer.name?.[0]?.toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-ink">{customer.name}</h3>
              <span className={STATUS_COLORS[customer.status] ?? 'badge-gray'}>{customer.status}</span>
            </div>
            <div className="flex flex-wrap gap-3 mt-1 text-xs text-ink-muted">
              {customer.email && <span className="flex items-center gap-1"><Mail className="w-3 h-3" />{customer.email}</span>}
              {customer.phone && <span className="flex items-center gap-1"><Phone className="w-3 h-3" />{customer.phone}</span>}
              {customer.country && <span className="flex items-center gap-1"><Globe className="w-3 h-3" />{customer.country}</span>}
            </div>
          </div>
          <button onClick={onClose} className="text-ink-muted hover:text-ink shrink-0"><X className="w-4 h-4" /></button>
        </div>

        {/* Interactions */}
        <div className="flex-1 overflow-y-auto p-6 space-y-3">
          <h4 className="text-xs font-semibold text-ink-muted uppercase tracking-wide">Interaction History</h4>
          {(interactions as Interaction[]).length === 0 ? (
            <div className="text-center py-6 text-ink-muted text-sm">
              <MessageSquare className="w-8 h-8 mx-auto mb-2 opacity-30" />
              No interactions recorded yet
            </div>
          ) : (interactions as Interaction[]).map(int => (
            <div key={int.id} className="flex gap-3">
              <div className="w-7 h-7 bg-slate-100 rounded-full flex items-center justify-center shrink-0">
                <MessageSquare className="w-3.5 h-3.5 text-ink-muted" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-ink capitalize">{int.type}</span>
                  {int.user_name && <span className="text-xs text-ink-muted">by {int.user_name}</span>}
                  <span className="text-xs text-ink-muted ml-auto">{fmtDate(int.inserted_at)}</span>
                </div>
                <p className="text-sm text-ink-secondary mt-0.5">{int.notes}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Log interaction */}
        <div className="p-4 border-t border-slate-100 space-y-2">
          <div className="flex gap-2">
            <select className="input flex-shrink-0 w-28 text-sm" value={interactionType} onChange={e => setInteractionType(e.target.value)}>
              {['call', 'email', 'meeting', 'demo', 'note'].map(t => (
                <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>
              ))}
            </select>
            <input className="input flex-1 text-sm" placeholder="Add a note…" value={note} onChange={e => setNote(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter' && note) mutation.mutate() }} />
            <button onClick={() => mutation.mutate()} disabled={!note || mutation.isPending} className="btn-primary px-3">
              {mutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function CustomersPage() {
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [showAdd, setShowAdd] = useState(false)
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null)

  const { data: custData, isLoading, refetch } = useQuery({
    queryKey: ['customers', search, statusFilter],
    queryFn: () => crmApi.customers(
      Object.fromEntries(
        Object.entries({ search, status: statusFilter }).filter(([, v]) => v)
      ) as Record<string, string>
    ).then(r => r.data?.data ?? r.data ?? []),
  })

  const { data: statsData } = useQuery({
    queryKey: ['crm-stats'],
    queryFn: () => crmApi.stats().then(r => r.data?.data ?? r.data),
  })

  const customers: Customer[] = custData ?? []

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <PageHeroHeader
        title="Investors & CRM"
        highlight="Investors"
        subtitle="Customer relationships, interactions & pipeline tracking"
        imageIndex={3}
        stats={[
          { label: 'total', value: statsData?.total ?? customers.length },
          { label: 'active', value: statsData?.active ?? customers.filter(c => c.status === 'active').length, positive: true },
        ]}
        actions={
          <HeroButton variant="orange" onClick={() => setShowAdd(true)}>
            <Plus className="w-3.5 h-3.5" />
            Add Customer
          </HeroButton>
        }
      />
      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        {/* Stats strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: 'Total', value: statsData?.total ?? customers.length, color: 'text-ink' },
            { label: 'Active', value: statsData?.active ?? customers.filter(c => c.status === 'active').length, color: 'text-success' },
            { label: 'Prospects', value: statsData?.prospect ?? customers.filter(c => c.status === 'prospect').length, color: 'text-info' },
            { label: 'Churned', value: statsData?.churned ?? customers.filter(c => c.status === 'churned').length, color: 'text-danger' },
          ].map(({ label, value, color }) => (
            <div key={label} className="card p-4">
              <div className={clsx('text-2xl font-bold', color)}>{value}</div>
              <div className="text-xs text-ink-muted">{label}</div>
            </div>
          ))}
        </div>

        {/* Toolbar */}
        <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
          <div className="flex gap-2 flex-1 max-w-md">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-muted" />
              <input className="input pl-9" placeholder="Search customers…" value={search} onChange={e => setSearch(e.target.value)} />
            </div>
            <select className="input w-36" value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
              <option value="">All status</option>
              {['active', 'inactive', 'prospect', 'churned'].map(s => (
                <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
              ))}
            </select>
          </div>
          <div className="flex gap-2">
            <button onClick={() => refetch()} className="btn-ghost">
              <RefreshCw className={clsx('w-4 h-4', isLoading && 'animate-spin')} />
            </button>
            <button onClick={() => setShowAdd(true)} className="btn-primary gap-2">
              <Plus className="w-4 h-4" />Add Customer
            </button>
          </div>
        </div>

        {/* Grid of customer cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
          {isLoading ? (
            <div className="col-span-4 text-center py-12">
              <Loader2 className="w-6 h-6 animate-spin mx-auto text-ink-muted" />
            </div>
          ) : customers.length === 0 ? (
            <div className="col-span-4 text-center py-12 text-ink-muted">
              <User className="w-10 h-10 mx-auto mb-2 opacity-30" />
              No customers found
            </div>
          ) : customers.map(c => (
            <button
              key={c.id}
              onClick={() => setSelectedCustomer(c)}
              className="card p-5 text-left card-hover group"
            >
              <div className="flex items-start gap-3 mb-3">
                <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center text-primary-700 font-bold shrink-0">
                  {c.name?.[0]?.toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-ink truncate">{c.name}</div>
                  <span className={clsx('text-[10px]', STATUS_COLORS[c.status] ?? 'badge-gray')}>{c.status}</span>
                </div>
              </div>
              <div className="space-y-1 text-xs text-ink-muted">
                {c.email && <div className="flex items-center gap-1 truncate"><Mail className="w-3 h-3 shrink-0" />{c.email}</div>}
                {c.phone && <div className="flex items-center gap-1"><Phone className="w-3 h-3 shrink-0" />{c.phone}</div>}
                {c.country && <div className="flex items-center gap-1"><Globe className="w-3 h-3 shrink-0" />{c.country}</div>}
                {c.industry && <div className="flex items-center gap-1"><ShoppingCart className="w-3 h-3 shrink-0" />{c.industry}</div>}
              </div>
              <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between">
                <span className="text-[10px] text-ink-muted">{c.inserted_at ? fmtDate(c.inserted_at) : 'N/A'}</span>
                <span className="text-[10px] text-primary-600 font-medium group-hover:underline flex items-center gap-0.5">
                  <MessageSquare className="w-3 h-3" />
                  View history
                </span>
              </div>
            </button>
          ))}
        </div>
      </div>

      {showAdd && <AddCustomerModal onClose={() => setShowAdd(false)} />}
      {selectedCustomer && (
        <CustomerDetailPanel customer={selectedCustomer} onClose={() => setSelectedCustomer(null)} />
      )}
    </div>
  )
}
