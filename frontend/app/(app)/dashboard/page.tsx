'use client'

import { useEffect, useState, useCallback } from 'react'
import { useQuery } from '@tanstack/react-query'
import {
  BarChart, Bar, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  AreaChart, Area, PieChart, Pie,
} from 'recharts'
import {
  TrendingUp, AlertCircle, Truck, Users, Package,
  DollarSign, Activity, RefreshCw, ArrowUpRight, ArrowDownRight,
  ShoppingCart, Clock, Building2, Star,
} from 'lucide-react'
import { dashboardApi, invoicesApi } from '@/lib/api'
import { useAuth } from '@/lib/auth-context'
import { joinChannel, leaveChannel } from '@/lib/socket'
import Topbar from '@/components/layout/Topbar'
import clsx from 'clsx'

const fmt = (n: number) =>
  n >= 1_000_000
    ? `${(n / 1_000_000).toFixed(1)}M`
    : n >= 1_000
    ? `${(n / 1_000).toFixed(0)}K`
    : String(n)

const fmtRwf = (n: number) => `${fmt(n)} RWF`

interface KpiCardProps {
  label: string
  value: string
  sub?: string
  icon: React.ElementType
  color: string
  trend?: number
}

function KpiCard({ label, value, sub, icon: Icon, color, trend }: KpiCardProps) {
  return (
    <div className="card p-5 flex flex-col gap-3 animate-fade-in">
      <div className="flex items-start justify-between">
        <div className={clsx('w-10 h-10 rounded-xl flex items-center justify-center', color)}>
          <Icon className="w-5 h-5" />
        </div>
        {trend !== undefined && (
          <span className={clsx(
            'flex items-center gap-0.5 text-xs font-semibold px-2 py-0.5 rounded-full',
            trend >= 0
              ? 'bg-success-bg text-success'
              : 'bg-danger-bg text-danger'
          )}>
            {trend >= 0 ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
            {Math.abs(trend)}%
          </span>
        )}
      </div>
      <div>
        <div className="text-2xl font-bold text-ink">{value}</div>
        <div className="text-sm font-medium text-ink-secondary mt-0.5">{label}</div>
        {sub && <div className="text-xs text-ink-muted mt-0.5">{sub}</div>}
      </div>
    </div>
  )
}

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

const DEPT_DATA = [
  { dept: 'Finance',    count: 8 },
  { dept: 'Operations', count: 12 },
  { dept: 'Logistics',  count: 9 },
  { dept: 'Sales & CRM',count: 7 },
  { dept: 'HR',         count: 5 },
  { dept: 'IT',         count: 4 },
  { dept: 'Executive',  count: 2 },
]

const TOP_CUSTOMERS = [
  { name: 'MTN Rwanda',   revenue: 18_500_000, invoices: 14, barW: 'w-full' },
  { name: 'BK Group',     revenue: 12_200_000, invoices: 9,  barW: 'w-[66%]' },
  { name: 'Equity Bank',  revenue: 8_750_000,  invoices: 7,  barW: 'w-[47%]' },
  { name: 'Inyange Ind.', revenue: 5_300_000,  invoices: 5,  barW: 'w-[29%]' },
  { name: 'Kigali City',  revenue: 3_900_000,  invoices: 4,  barW: 'w-[21%]' },
]

const MODULE_ACTIVITY = [
  { name: 'Invoicing',  value: 38, color: '#22C55E', dot: 'bg-primary-500' },
  { name: 'Inventory',  value: 24, color: '#3B82F6', dot: 'bg-blue-500' },
  { name: 'Fleet',      value: 18, color: '#F59E0B', dot: 'bg-amber-500' },
  { name: 'HR',         value: 12, color: '#A855F7', dot: 'bg-purple-500' },
  { name: 'CRM',        value: 8,  color: '#EC4899', dot: 'bg-pink-500' },
]

export default function DashboardPage() {
  const { token } = useAuth() as { token: string | null }
  const [liveEvents, setLiveEvents] = useState<{ id: number; text: string; time: string; type: string }[]>([])
  const [year] = useState(new Date().getFullYear())

  const { data: ceo, isLoading, refetch } = useQuery({
    queryKey: ['dashboard-ceo', year],
    queryFn: () => dashboardApi.ceo(year).then(r => r.data),
    staleTime: 30_000,
  })

  const { data: revenue } = useQuery({
    queryKey: ['revenue-monthly', year],
    queryFn: () => invoicesApi.revenueByMonth(year).then(r => r.data),
  })

  const addEvent = useCallback((text: string, type: string) => {
    setLiveEvents(prev => [
      { id: Date.now(), text, time: new Date().toLocaleTimeString(), type },
      ...prev.slice(0, 19),
    ])
  }, [])

  useEffect(() => {
    if (!token) return
    const ch = joinChannel('org:dashboard', token)
    ch.on('invoice_created', p => addEvent(`New invoice #${p.number} created`, 'invoice'))
    ch.on('invoice_approved', p => addEvent(`Invoice #${p.number} approved`, 'success'))
    ch.on('stock_adjusted', p => addEvent(`Stock adjusted: ${p.item} (${p.delta > 0 ? '+' : ''}${p.delta})`, 'inventory'))
    ch.on('payroll_processed', p => addEvent(`Payroll processed for ${p.period}`, 'payroll'))
    ch.on('vehicle_location', p => addEvent(`Vehicle ${p.plate} updated position`, 'fleet'))
    return () => { leaveChannel(ch) }
  }, [token, addEvent])

  const revenueData = revenue?.data?.map((r: { month: number; total: number }) => ({
    month: MONTHS[r.month - 1],
    revenue: r.total,
  })) ?? []

  const invoiceStats = ceo?.invoice_stats ?? {}
  const fleetStats = ceo?.fleet_stats ?? {}
  const inventorySummary = ceo?.inventory_summary ?? {}
  const hrStats = ceo?.hr_stats ?? {}
  const crmStats = ceo?.crm_stats ?? {}

  const totalRevenue = ceo?.total_revenue ?? 0
  const overdueAmount = ceo?.overdue_amount ?? 0
  const overdueCount = ceo?.overdue_count ?? 0

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <Topbar
        title="CEO Dashboard"
        subtitle={`Live overview · ${new Date().toLocaleDateString('en-RW', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}`}
      />

      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {/* Header row */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-ink">Business Overview</h2>
            <p className="text-sm text-ink-muted">Real-time metrics across all modules</p>
          </div>
          <button onClick={() => refetch()} className="btn-ghost text-sm gap-2">
            <RefreshCw className={clsx('w-4 h-4', isLoading && 'animate-spin')} />
            Refresh
          </button>
        </div>

        {/* KPI grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <KpiCard
            label="Total Revenue"
            value={fmtRwf(totalRevenue)}
            sub={`${year} YTD`}
            icon={DollarSign}
            color="bg-primary-100 text-primary-600"
            trend={12}
          />
          <KpiCard
            label="Overdue Invoices"
            value={fmtRwf(overdueAmount)}
            sub={`${overdueCount} invoices`}
            icon={AlertCircle}
            color="bg-danger-bg text-danger"
            trend={-5}
          />
          <KpiCard
            label="Active Vehicles"
            value={String(fleetStats.active ?? 0)}
            sub={`${fleetStats.total ?? 0} total fleet`}
            icon={Truck}
            color="bg-blue-100 text-blue-600"
          />
          <KpiCard
            label="Employees"
            value={String(hrStats.total ?? 0)}
            sub={`${hrStats.departments ?? 0} departments`}
            icon={Users}
            color="bg-purple-100 text-purple-600"
            trend={3}
          />
        </div>

        {/* Second KPI row */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <KpiCard
            label="Paid Invoices"
            value={String(invoiceStats.paid ?? 0)}
            sub={`${invoiceStats.draft ?? 0} drafts · ${invoiceStats.pending ?? 0} pending`}
            icon={TrendingUp}
            color="bg-primary-100 text-primary-600"
          />
          <KpiCard
            label="Stock Items"
            value={String(inventorySummary.total_items ?? 0)}
            sub={`${inventorySummary.low_stock ?? 0} low stock alerts`}
            icon={Package}
            color="bg-orange-100 text-orange-600"
          />
          <KpiCard
            label="Customers"
            value={String(crmStats.total ?? 0)}
            sub={`${crmStats.active ?? 0} active accounts`}
            icon={ShoppingCart}
            color="bg-info-bg text-info"
          />
          <KpiCard
            label="Pending Payrolls"
            value={String(hrStats.pending_payroll ?? 0)}
            sub="Awaiting approval"
            icon={Clock}
            color="bg-warning-bg text-warning"
          />
        </div>

        {/* Charts row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Revenue chart */}
          <div className="card p-5 lg:col-span-2">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-semibold text-ink">Monthly Revenue</h3>
                <p className="text-xs text-ink-muted">{year} — RWF</p>
              </div>
              <span className="badge-green text-xs">Live</span>
            </div>
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={revenueData} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="revGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#22C55E" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#22C55E" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#94A3B8' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#94A3B8' }} axisLine={false} tickLine={false} tickFormatter={v => fmt(v)} />
                <Tooltip
                  contentStyle={{ background: '#0F172A', border: '1px solid #1E293B', borderRadius: 10, fontSize: 12 }}
                  labelStyle={{ color: '#94A3B8' }}
                  itemStyle={{ color: '#22C55E' }}
                  formatter={(v: number) => [fmtRwf(v), 'Revenue']}
                />
                <Area type="monotone" dataKey="revenue" stroke="#22C55E" strokeWidth={2} fill="url(#revGradient)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Invoice status breakdown */}
          <div className="card p-5">
            <h3 className="font-semibold text-ink mb-4">Invoice Status</h3>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart
                data={[
                  { name: 'Draft', value: invoiceStats.draft ?? 0, fill: '#94A3B8' },
                  { name: 'Pending', value: invoiceStats.pending ?? 0, fill: '#F59E0B' },
                  { name: 'Paid', value: invoiceStats.paid ?? 0, fill: '#22C55E' },
                  { name: 'Overdue', value: overdueCount, fill: '#EF4444' },
                ]}
                margin={{ top: 5, right: 5, left: -20, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#94A3B8' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 10, fill: '#94A3B8' }} axisLine={false} tickLine={false} />
                <Tooltip
                  contentStyle={{ background: '#0F172A', border: '1px solid #1E293B', borderRadius: 10, fontSize: 12 }}
                  itemStyle={{ color: '#E2E8F0' }}
                />
                <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                  {['#94A3B8', '#F59E0B', '#22C55E', '#EF4444'].map((color, idx) => (
                    <Cell key={idx} fill={color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* ── Department headcount + module activity ──────── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="card p-5 lg:col-span-2">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-semibold text-ink">Headcount by Department</h3>
                <p className="text-xs text-ink-muted">Current staff distribution</p>
              </div>
              <div className="flex items-center gap-1.5 text-xs text-ink-muted">
                <Building2 className="w-3.5 h-3.5" />
                {DEPT_DATA.reduce((s, d) => s + d.count, 0)} total
              </div>
            </div>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart layout="vertical" data={DEPT_DATA} margin={{ top: 0, right: 30, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" horizontal={false} />
                <XAxis type="number" tick={{ fontSize: 10, fill: '#94A3B8' }} axisLine={false} tickLine={false} />
                <YAxis type="category" dataKey="dept" tick={{ fontSize: 11, fill: '#64748B' }} axisLine={false} tickLine={false} width={80} />
                <Tooltip
                  contentStyle={{ background: '#0F172A', border: '1px solid #1E293B', borderRadius: 8, fontSize: 12 }}
                  itemStyle={{ color: '#22C55E' }}
                  formatter={(v: number) => [v, 'Employees']}
                />
                <Bar dataKey="count" fill="#22C55E" radius={[0, 6, 6, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="card p-5">
            <h3 className="font-semibold text-ink mb-4">Module Activity</h3>
            <div className="flex justify-center mb-4">
              <ResponsiveContainer width={140} height={140}>
                <PieChart>
                  <Pie
                    data={MODULE_ACTIVITY}
                    cx="50%"
                    cy="50%"
                    innerRadius={42}
                    outerRadius={62}
                    dataKey="value"
                    strokeWidth={0}
                  >
                    {MODULE_ACTIVITY.map((entry, i) => (
                      <Cell key={i} fill={entry.color} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="space-y-2">
              {MODULE_ACTIVITY.map(m => (
                <div key={m.name} className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className={clsx('w-2 h-2 rounded-full shrink-0', m.dot)} />
                    <span className="text-ink-secondary">{m.name}</span>
                  </div>
                  <span className="font-semibold text-ink">{m.value}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── Fleet + live feed ────────────────────────────── */}
        {/* Bottom row: fleet + live feed */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Fleet status */}
          <div className="card p-5">
            <h3 className="font-semibold text-ink mb-4">Fleet Status</h3>
            <div className="space-y-3">
              {[
                { label: 'Active', value: fleetStats.active ?? 0, color: 'bg-primary-500', pct: fleetStats.total ? ((fleetStats.active ?? 0) / fleetStats.total * 100) : 0 },
                { label: 'Idle', value: fleetStats.idle ?? 0, color: 'bg-warning', pct: fleetStats.total ? ((fleetStats.idle ?? 0) / fleetStats.total * 100) : 0 },
                { label: 'Maintenance', value: fleetStats.maintenance ?? 0, color: 'bg-danger', pct: fleetStats.total ? ((fleetStats.maintenance ?? 0) / fleetStats.total * 100) : 0 },
              ].map(({ label, value, color, pct }) => (
                <div key={label}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-ink-secondary">{label}</span>
                    <span className="font-semibold text-ink">{value}</span>
                  </div>
                  <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div className={clsx('h-full rounded-full transition-all', color)} style={{ width: `${pct}%` }} />
                  </div>
                </div>
              ))}
              <div className="pt-2 border-t border-slate-100 flex justify-between text-xs text-ink-muted">
                <span>Total fleet: <strong className="text-ink">{fleetStats.total ?? 0}</strong></span>
                <span>GPS active: <strong className="text-primary-600">{fleetStats.gps_active ?? 0}</strong></span>
              </div>
            </div>
          </div>

          {/* Live activity feed */}
          <div className="card p-5 flex flex-col">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-ink">Live Activity</h3>
              <span className="flex items-center gap-1.5 text-xs text-primary-600">
                <Activity className="w-3 h-3" />
                Real-time
              </span>
            </div>
            <div className="flex-1 overflow-y-auto space-y-2 max-h-48 no-scrollbar">
              {liveEvents.length === 0 ? (
                <div className="text-center py-8 text-ink-muted text-sm">
                  <Activity className="w-8 h-8 mx-auto mb-2 opacity-30" />
                  Waiting for live events…
                </div>
              ) : liveEvents.map(ev => (
                <div key={ev.id} className="flex items-start gap-2.5 py-1.5 border-b border-slate-50 last:border-0 animate-fade-in">
                  <div className={clsx('w-1.5 h-1.5 rounded-full mt-1.5 shrink-0', {
                    'bg-primary-500': ev.type === 'invoice' || ev.type === 'success',
                    'bg-orange-400': ev.type === 'inventory',
                    'bg-purple-400': ev.type === 'payroll',
                    'bg-blue-400': ev.type === 'fleet',
                  })} />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-ink">{ev.text}</p>
                    <p className="text-[10px] text-ink-muted">{ev.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── Top customers ────────────────────────────────── */}
        <div className="card p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-semibold text-ink">Top Customers by Revenue</h3>
              <p className="text-xs text-ink-muted">{new Date().getFullYear()} YTD</p>
            </div>
            <Star className="w-4 h-4 text-amber-400" />
          </div>
          <div className="space-y-0 divide-y divide-slate-50">
            {TOP_CUSTOMERS.map((c, i) => (
              <div key={c.name} className="flex items-center gap-4 py-2.5">
                <span className="w-5 text-xs font-bold text-ink-muted text-center shrink-0">{i + 1}</span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium text-ink truncate">{c.name}</span>
                    <span className="text-xs font-semibold text-ink shrink-0 ml-3">{fmtRwf(c.revenue)}</span>
                  </div>
                  <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                    <div className={clsx('h-full bg-gradient-to-r from-primary-500 to-primary-400 rounded-full transition-all', c.barW)} />
                  </div>
                </div>
                <span className="text-xs text-ink-muted shrink-0">{c.invoices} inv.</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
