'use client'

import { useState, useCallback } from 'react'
import { reportsApi } from '@/lib/api'
import PageHeroHeader from '@/components/dashboard/PageHeroHeader'
import {
  BarChart3, FileText, DollarSign, Package, Truck,
  Users, AlertTriangle, Play, Clock, CheckCircle,
  Download, Loader2, TrendingUp, Zap
} from 'lucide-react'
import toast from 'react-hot-toast'
import clsx from 'clsx'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts'
const REPORT_TYPES = [
  {
    type: 'monthly_revenue',
    label: 'Monthly Revenue',
    description: 'Revenue breakdown by month, including paid vs pending invoices.',
    icon: DollarSign,
    color: 'bg-primary-100 text-primary-600',
    border: 'border-primary-100',
  },
  {
    type: 'inventory_audit',
    label: 'Inventory Audit',
    description: 'Complete stock snapshot across all warehouses with low-stock alerts.',
    icon: Package,
    color: 'bg-orange-100 text-orange-600',
    border: 'border-orange-100',
  },
  {
    type: 'payroll_summary',
    label: 'Payroll Summary',
    description: 'Gross salary, PAYE tax deductions, and net pay per department.',
    icon: Users,
    color: 'bg-purple-100 text-purple-600',
    border: 'border-purple-100',
  },
  {
    type: 'fleet_utilization',
    label: 'Fleet Utilization',
    description: 'Vehicle activity, fuel consumption, and utilization rate.',
    icon: Truck,
    color: 'bg-blue-100 text-blue-600',
    border: 'border-blue-100',
  },
  {
    type: 'overdue_invoices',
    label: 'Overdue Invoices',
    description: 'Outstanding overdue invoices with aging analysis and customer details.',
    icon: AlertTriangle,
    color: 'bg-red-100 text-red-600',
    border: 'border-red-100',
  },
]

interface ReportJob {
  id: string
  type: string
  status: 'queued' | 'running' | 'done' | 'error'
  result?: unknown
  requestedAt: Date
}

const fmtRwf = (n: number) =>
  new Intl.NumberFormat('en-RW', { maximumFractionDigits: 0 }).format(n) + ' RWF'

function ReportResult({ result, type }: { result: unknown; type: string }) {
  if (!result || typeof result !== 'object') return null
  const data = result as Record<string, unknown>

  if (type === 'monthly_revenue' && Array.isArray((data as { data?: unknown[] }).data)) {
    const chartData = (data.data as { month: number; total: number }[]).map(r => ({
      month: ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'][r.month - 1],
      revenue: r.total,
    }))
    return (
      <div className="mt-4 pt-4 border-t border-slate-100">
        <p className="text-xs font-semibold text-ink-muted uppercase tracking-wide mb-3">Revenue by Month (2025)</p>
        <ResponsiveContainer width="100%" height={160}>
          <BarChart data={chartData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
            <XAxis dataKey="month" tick={{ fontSize: 9, fill: '#94A3B8' }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 9, fill: '#94A3B8' }} axisLine={false} tickLine={false} tickFormatter={v => `${(v/1_000_000).toFixed(0)}M`} />
            <Tooltip
              contentStyle={{ background: '#0F172A', borderRadius: 8, border: 'none', fontSize: 11 }}
              itemStyle={{ color: '#22C55E' }}
              formatter={(v: number) => [fmtRwf(v), 'Revenue']}
            />
            <Bar dataKey="revenue" fill="#22C55E" radius={[3, 3, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
        <p className="text-xs text-ink-muted mt-2 text-right">
          Total: <strong className="text-ink">{fmtRwf((data.data as {total:number}[]).reduce((s, r) => s + r.total, 0))}</strong>
        </p>
      </div>
    )
  }

  const rows = (Array.isArray(data.data) ? data.data : Array.isArray(data) ? data : []) as Record<string, unknown>[]
  if (!rows.length) return <p className="text-xs text-ink-muted mt-2">No data returned.</p>
  const cols = Object.keys(rows[0]).slice(0, 5)
  return (
    <div className="mt-4 pt-4 border-t border-slate-100 overflow-x-auto">
      <p className="text-xs font-semibold text-ink-muted uppercase tracking-wide mb-2">{rows.length} records</p>
      <table className="w-full text-xs">
        <thead>
          <tr className="border-b border-slate-100">
            {cols.map(c => <th key={c} className="text-left py-1.5 pr-3 text-ink-muted font-medium capitalize">{c.replace(/_/g, ' ')}</th>)}
          </tr>
        </thead>
        <tbody>
          {rows.slice(0, 5).map((row, i) => (
            <tr key={i} className="border-b border-slate-50 last:border-0">
              {cols.map(c => <td key={c} className="py-1.5 pr-3 text-ink-secondary">{String(row[c] ?? '—').slice(0, 30)}</td>)}
            </tr>
          ))}
        </tbody>
      </table>
      {rows.length > 5 && <p className="text-[10px] text-ink-muted mt-1">+ {rows.length - 5} more rows</p>}
    </div>
  )
}

const STATS = [
  { label: 'Reports Generated', value: '148', icon: BarChart3, color: 'text-primary-600 bg-primary-50' },
  { label: 'This Month', value: '12', icon: TrendingUp, color: 'text-blue-600 bg-blue-50' },
  { label: 'Avg. Generate Time', value: '2.4s', icon: Zap, color: 'text-purple-600 bg-purple-50' },
]

export default function ReportsPage() {
  const [jobs, setJobs] = useState<ReportJob[]>([])
  const [generating, setGenerating] = useState<string | null>(null)

  const generate = useCallback(async (type: string) => {
    setGenerating(type)
    const jobId = 'job-' + Date.now()
    setJobs(prev => [{ id: jobId, type, status: 'queued', requestedAt: new Date() }, ...prev])

    try {
      const res = await reportsApi.generate(type)
      const serverJobId = res.data?.job_id ?? jobId
      setJobs(prev => prev.map(j =>
        j.id === jobId ? { ...j, id: serverJobId, status: 'running' } : j
      ))
      toast.success(`${REPORT_TYPES.find(r => r.type === type)?.label} report queued — results will arrive in your notifications`)
    } catch {
      setJobs(prev => prev.map(j => j.id === jobId ? { ...j, status: 'error' } : j))
      toast.error('Failed to generate report')
    } finally {
      setGenerating(null)
    }
  }, [])

  const getJob = (type: string) => jobs.find(j => j.type === type)

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <PageHeroHeader
        title="Reports"
        highlight="Reports"
        subtitle="Generate and export business intelligence reports"
        imageIndex={0}
        stats={[
          { label: 'generated', value: 148 },
          { label: 'this month', value: 12, positive: true },
        ]}
      />

      <div className="flex-1 overflow-y-auto p-6 space-y-6">

        {/* Stats strip */}
        <div className="grid grid-cols-3 gap-4">
          {STATS.map(({ label, value, icon: Icon, color }) => (
            <div key={label} className="card p-4 flex items-center gap-3">
              <div className={clsx('w-9 h-9 rounded-xl flex items-center justify-center shrink-0', color)}>
                <Icon className="w-4 h-4" />
              </div>
              <div>
                <div className="text-xl font-bold text-ink">{value}</div>
                <div className="text-xs text-ink-muted">{label}</div>
              </div>
            </div>
          ))}
        </div>

        <div>
          <h2 className="text-base font-bold text-ink mb-1">Available Reports</h2>
          <p className="text-sm text-ink-muted">Click Generate — results appear inline within seconds.</p>
        </div>

        {/* Report cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {REPORT_TYPES.map(({ type, label, description, icon: Icon, color, border }) => {
            const job = getJob(type)
            const isRunning = generating === type
            const isDone = job?.status === 'done'
            const isError = job?.status === 'error'

            return (
              <div key={type} className={clsx('card p-5 flex flex-col border', isDone ? border : 'border-transparent')}>
                <div className="flex items-start gap-3 mb-3">
                  <div className={clsx('w-10 h-10 rounded-xl flex items-center justify-center shrink-0', color)}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-ink text-sm">{label}</h3>
                      {isDone && <CheckCircle className="w-3.5 h-3.5 text-success shrink-0" />}
                    </div>
                    <p className="text-xs text-ink-muted mt-0.5 leading-relaxed">{description}</p>
                  </div>
                </div>

                {isDone && job?.result != null && (
                  <ReportResult result={job.result} type={type} />
                )}

                <div className="mt-auto pt-4 flex gap-2">
                  <button
                    type="button"
                    onClick={() => generate(type)}
                    disabled={isRunning || !!generating}
                    className={clsx(
                      'flex-1 flex items-center justify-center gap-2 rounded-xl py-2 text-sm font-semibold transition-all',
                      isDone
                        ? 'bg-slate-100 hover:bg-slate-200 text-ink-secondary'
                        : 'btn-primary',
                      (isRunning || !!generating) && 'opacity-60 cursor-not-allowed'
                    )}
                  >
                    {isRunning
                      ? <><Loader2 className="w-3.5 h-3.5 animate-spin" />Generating…</>
                      : isDone
                      ? <><Play className="w-3.5 h-3.5" />Regenerate</>
                      : <><Play className="w-3.5 h-3.5" />Generate</>}
                  </button>
                  {isDone && (
                    <button type="button" className="btn-ghost px-3 text-ink-muted hover:text-primary-600" title="Export CSV">
                      <Download className="w-4 h-4" />
                    </button>
                  )}
                </div>

                {job && !isDone && (
                  <div className={clsx('mt-2 flex items-center gap-1.5 text-[11px]',
                    isError ? 'text-danger' : 'text-ink-muted')}>
                    {isRunning && <Loader2 className="w-3 h-3 animate-spin" />}
                    {isError && <AlertTriangle className="w-3 h-3" />}
                    {!isRunning && !isError && <Clock className="w-3 h-3" />}
                    {isRunning ? 'Processing data…'
                      : isError ? 'Failed — try again'
                      : `Queued ${job.requestedAt.toLocaleTimeString()}`}
                  </div>
                )}
              </div>
            )
          })}
        </div>

        {/* Job history */}
        {jobs.length > 0 && (
          <div className="card overflow-hidden">
            <div className="px-5 py-3.5 border-b border-slate-100 flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-ink-muted" />
              <h3 className="font-semibold text-ink text-sm">Run History</h3>
              <span className="ml-auto text-xs text-ink-muted">{jobs.length} jobs</span>
            </div>
            <table className="table">
              <thead>
                <tr>
                  <th>Report</th>
                  <th>Job ID</th>
                  <th>Requested</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {jobs.map(job => {
                  const meta = REPORT_TYPES.find(r => r.type === job.type)
                  const Icon = meta?.icon ?? FileText
                  return (
                    <tr key={job.id}>
                      <td>
                        <div className="flex items-center gap-2">
                          <Icon className="w-3.5 h-3.5 text-ink-muted" />
                          <span className="font-medium text-ink text-sm">{meta?.label ?? job.type}</span>
                        </div>
                      </td>
                      <td className="font-mono text-xs text-ink-muted">{job.id.slice(0, 14)}</td>
                      <td className="text-ink-muted text-xs">{job.requestedAt.toLocaleTimeString()}</td>
                      <td>
                        <span className={clsx(
                          job.status === 'done'   ? 'badge-green' :
                          job.status === 'error'  ? 'badge-red' :
                          job.status === 'queued' ? 'badge-yellow' : 'badge-blue'
                        )}>
                          {job.status === 'queued' && generating === job.type ? 'running' : job.status}
                        </span>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
