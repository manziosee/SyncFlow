'use client'

import { useEffect, useState, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { invoicesApi } from '@/lib/api'
import { useAuth } from '@/lib/auth-context'
import { joinChannel, leaveChannel } from '@/lib/socket'
import { Channel } from 'phoenix'
import Topbar from '@/components/layout/Topbar'
import {
  ArrowLeft, CheckCircle, XCircle, Send, FileText,
  Users, Clock, Loader2, AlertCircle
} from 'lucide-react'
import Link from 'next/link'
import toast from 'react-hot-toast'
import clsx from 'clsx'

const fmtRwf = (n: number) =>
  new Intl.NumberFormat('en-RW', { maximumFractionDigits: 0 }).format(n) + ' RWF'

const fmtDate = (d: string) =>
  new Date(d).toLocaleDateString('en-RW', { day: '2-digit', month: 'long', year: 'numeric' })

const STATUS_COLORS: Record<string, string> = {
  draft: 'badge-gray',
  submitted: 'badge-blue',
  approved: 'badge-green',
  paid: 'badge-green',
  rejected: 'badge-red',
  overdue: 'badge-red',
  void: 'badge-gray',
}

interface ActiveUser {
  user_id: string
  name: string
  color: string
}

export default function InvoiceDetailPage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const qc = useQueryClient()
  const { token, user } = useAuth() as { token: string | null; user: { id: string; name: string } | null }
  const [channel, setChannel] = useState<Channel | null>(null)
  const [activeUsers, setActiveUsers] = useState<ActiveUser[]>([])
  const [rejectReason, setRejectReason] = useState('')
  const [showReject, setShowReject] = useState(false)

  const { data, isLoading } = useQuery({
    queryKey: ['invoice', id],
    queryFn: () => invoicesApi.get(id).then(r => r.data),
    enabled: !!id,
  })

  const invoice = data?.data ?? data

  const refetchInvoice = useCallback(() => {
    qc.invalidateQueries({ queryKey: ['invoice', id] })
  }, [qc, id])

  useEffect(() => {
    if (!token || !id) return
    const ch = joinChannel(`invoice:${id}`, token, { user_id: user?.id, name: user?.name })
    ch.on('field_updated', () => refetchInvoice())
    ch.on('status_changed', () => refetchInvoice())
    ch.on('presence_state', (state: Record<string, { metas: { name: string; color: string }[] }>) => {
      const users = Object.entries(state).map(([uid, v]) => ({
        user_id: uid,
        name: v.metas[0]?.name ?? 'User',
        color: v.metas[0]?.color ?? '#22C55E',
      }))
      setActiveUsers(users)
    })
    ch.on('presence_diff', (_diff: unknown) => {
      ch.push('presence_list', {}).receive('ok', (state: Record<string, { metas: { name: string; color: string }[] }>) => {
        const users = Object.entries(state).map(([uid, v]) => ({
          user_id: uid,
          name: v.metas[0]?.name ?? 'User',
          color: v.metas[0]?.color ?? '#22C55E',
        }))
        setActiveUsers(users)
      })
    })
    setChannel(ch)
    return () => { leaveChannel(ch) }
  }, [token, id, user, refetchInvoice])

  const submitMutation = useMutation({
    mutationFn: () => invoicesApi.submit(id),
    onSuccess: () => { refetchInvoice(); toast.success('Invoice submitted for approval') },
    onError: () => toast.error('Submit failed'),
  })

  const approveMutation = useMutation({
    mutationFn: () => invoicesApi.approve(id),
    onSuccess: () => { refetchInvoice(); toast.success('Invoice approved') },
    onError: () => toast.error('Approve failed'),
  })

  const rejectMutation = useMutation({
    mutationFn: () => invoicesApi.reject(id, rejectReason),
    onSuccess: () => { refetchInvoice(); setShowReject(false); toast.success('Invoice rejected') },
    onError: () => toast.error('Reject failed'),
  })

  const voidMutation = useMutation({
    mutationFn: () => invoicesApi.void(id),
    onSuccess: () => { refetchInvoice(); toast.success('Invoice voided') },
    onError: () => toast.error('Void failed'),
  })

  if (isLoading) {
    return (
      <div className="flex flex-col h-full overflow-hidden">
        <Topbar title="Invoice" />
        <div className="flex-1 flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary-500" />
        </div>
      </div>
    )
  }

  if (!invoice) {
    return (
      <div className="flex flex-col h-full overflow-hidden">
        <Topbar title="Invoice Not Found" />
        <div className="flex-1 flex flex-col items-center justify-center gap-3 text-ink-muted">
          <AlertCircle className="w-12 h-12 opacity-30" />
          <p>This invoice does not exist or was deleted.</p>
          <Link href="/invoices" className="btn-primary">Back to Invoices</Link>
        </div>
      </div>
    )
  }

  const lineItems: { description: string; quantity: number; unit_price: number }[] = invoice.line_items ?? []
  const total = lineItems.reduce((s: number, i) => s + i.quantity * i.unit_price, 0)

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <Topbar
        title={`Invoice ${String(invoice.number ?? invoice.id).slice(0, 8)}`}
        subtitle={invoice.customer_name}
      />

      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        {/* Back + actions */}
        <div className="flex items-center justify-between flex-wrap gap-3">
          <Link href="/invoices" className="flex items-center gap-1.5 text-sm text-ink-muted hover:text-ink transition-colors">
            <ArrowLeft className="w-4 h-4" />
            Back to Invoices
          </Link>

          <div className="flex items-center gap-2 flex-wrap">
            {/* Live collaborators */}
            {activeUsers.length > 0 && (
              <div className="flex items-center gap-1 px-3 py-1.5 bg-primary-50 rounded-full border border-primary-100">
                <Users className="w-3.5 h-3.5 text-primary-600" />
                <span className="text-xs text-primary-700 font-medium">{activeUsers.length} viewing</span>
                <div className="flex -space-x-1 ml-1">
                  {activeUsers.slice(0, 4).map(u => (
                    <div key={u.user_id}
                      className="w-5 h-5 rounded-full border-2 border-white flex items-center justify-center text-[8px] font-bold text-white"
                      style={{ backgroundColor: u.color }}
                      title={u.name}
                    >
                      {u.name?.[0]?.toUpperCase()}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {invoice.status === 'draft' && (
              <button onClick={() => submitMutation.mutate()} disabled={submitMutation.isPending} className="btn-primary gap-2">
                {submitMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                Submit for Approval
              </button>
            )}
            {invoice.status === 'submitted' && (
              <>
                <button onClick={() => approveMutation.mutate()} disabled={approveMutation.isPending} className="btn-primary gap-2">
                  {approveMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
                  Approve
                </button>
                <button onClick={() => setShowReject(true)} className="btn-danger gap-2">
                  <XCircle className="w-4 h-4" />
                  Reject
                </button>
              </>
            )}
            {!['void', 'paid'].includes(invoice.status) && (
              <button onClick={() => voidMutation.mutate()} className="btn-ghost text-sm">
                Void
              </button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Main invoice */}
          <div className="lg:col-span-2 space-y-4">
            <div className="card p-6">
              {/* Header */}
              <div className="flex items-start justify-between mb-6">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <FileText className="w-5 h-5 text-primary-500" />
                    <span className="font-mono font-bold text-ink">{String(invoice.number ?? invoice.id)}</span>
                  </div>
                  <span className={STATUS_COLORS[invoice.status] ?? 'badge-gray'}>{invoice.status}</span>
                </div>
                <div className="text-right text-sm text-ink-muted">
                  {invoice.inserted_at && <div>Created: {fmtDate(invoice.inserted_at)}</div>}
                  {invoice.due_date && <div className={clsx(invoice.status === 'overdue' && 'text-danger font-medium')}>
                    Due: {fmtDate(invoice.due_date)}
                  </div>}
                </div>
              </div>

              {/* Customer */}
              <div className="bg-slate-50 rounded-xl p-4 mb-6">
                <div className="text-xs font-semibold text-ink-muted uppercase tracking-wide mb-1">Bill To</div>
                <div className="font-semibold text-ink">{invoice.customer_name}</div>
                {invoice.customer_email && <div className="text-sm text-ink-muted">{invoice.customer_email}</div>}
              </div>

              {/* Line items */}
              <table className="table mb-4">
                <thead>
                  <tr>
                    <th>Description</th>
                    <th className="text-right">Qty</th>
                    <th className="text-right">Unit Price</th>
                    <th className="text-right">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {lineItems.map((item, i) => (
                    <tr key={i}>
                      <td>{item.description}</td>
                      <td className="text-right">{item.quantity}</td>
                      <td className="text-right">{fmtRwf(item.unit_price)}</td>
                      <td className="text-right font-medium">{fmtRwf(item.quantity * item.unit_price)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Total */}
              <div className="flex justify-end">
                <div className="text-right">
                  <div className="text-sm text-ink-muted">Total Amount</div>
                  <div className="text-2xl font-bold text-ink">{fmtRwf(total || invoice.total_amount)}</div>
                </div>
              </div>

              {invoice.notes && (
                <div className="mt-4 pt-4 border-t border-slate-100">
                  <div className="text-xs font-semibold text-ink-muted uppercase tracking-wide mb-1">Notes</div>
                  <p className="text-sm text-ink-secondary">{invoice.notes}</p>
                </div>
              )}
            </div>
          </div>

          {/* Sidebar info */}
          <div className="space-y-4">
            <div className="card p-5">
              <h3 className="font-semibold text-ink mb-3 flex items-center gap-2">
                <Clock className="w-4 h-4 text-ink-muted" />
                Timeline
              </h3>
              <div className="space-y-3">
                {[
                  { label: 'Created', date: invoice.inserted_at, color: 'bg-slate-400' },
                  { label: 'Submitted', date: invoice.submitted_at, color: 'bg-blue-400' },
                  { label: 'Approved', date: invoice.approved_at, color: 'bg-primary-500' },
                  { label: 'Paid', date: invoice.paid_at, color: 'bg-primary-600' },
                ].filter(e => e.date).map(({ label, date, color }) => (
                  <div key={label} className="flex items-start gap-2.5">
                    <div className={clsx('w-2 h-2 rounded-full mt-1 shrink-0', color)} />
                    <div>
                      <div className="text-sm font-medium text-ink">{label}</div>
                      <div className="text-xs text-ink-muted">{fmtDate(String(date))}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {invoice.approval_notes && (
              <div className="card p-5">
                <h3 className="font-semibold text-ink mb-2">Approval Notes</h3>
                <p className="text-sm text-ink-secondary">{invoice.approval_notes}</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Reject modal */}
      {showReject && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-2xl">
            <h3 className="font-bold text-ink mb-3">Reject Invoice</h3>
            <textarea
              className="input w-full"
              rows={3}
              placeholder="Reason for rejection…"
              value={rejectReason}
              onChange={e => setRejectReason(e.target.value)}
            />
            <div className="flex gap-2 mt-4">
              <button onClick={() => setShowReject(false)} className="btn-ghost flex-1">Cancel</button>
              <button
                onClick={() => rejectMutation.mutate()}
                disabled={!rejectReason || rejectMutation.isPending}
                className="btn-danger flex-1 gap-2"
              >
                {rejectMutation.isPending && <Loader2 className="w-4 h-4 animate-spin" />}
                Reject
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
