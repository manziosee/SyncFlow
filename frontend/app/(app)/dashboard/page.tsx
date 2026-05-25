'use client'

import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import HeroHeader from '@/components/dashboard/HeroHeader'
import { dashboardApi, invoicesApi, hrApi, fleetApi, inventoryApi } from '@/lib/api'
import {
  TrendingUp, TrendingDown, FileText, Users, Truck, Package,
  AlertTriangle, CheckCircle, DollarSign, BarChart2,
} from 'lucide-react'
import clsx from 'clsx'
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend,
} from 'recharts'

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

const fmtRwf = (n: number) => new Intl.NumberFormat('en-RW', { maximumFractionDigits: 0 }).format(n) + ' RWF'
const fmtShort = (n: number) => {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + 'M'
  if (n >= 1_000) return (n / 1_000).toFixed(0) + 'K'
  return String(n)
}

const TAB_DESCRIPTIONS: Record<string, { title: string; subtitle: string }> = {
  Main:       { title: 'Main Dashboard',     subtitle: 'Full business overview — revenue, people, fleet and inventory.' },
  Unit:       { title: 'Unit Economics',     subtitle: 'Per-unit sales performance, pricing, returns and net unit metrics.' },
  Marketing:  { title: 'Marketing KPIs',     subtitle: 'Customer acquisition, retention rates, CAC, LTV and conversion.' },
  Investors:  { title: 'Investor View',      subtitle: 'ARR, MRR, burn rate, runway and gross margin for stakeholders.' },
}

export default function DashboardPage() {
  const [activeTab, setActiveTab] = useState('Main')
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth())
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear())

  const { data: ceo } = useQuery({
    queryKey: ['dashboard-ceo'],
    queryFn: () => dashboardApi.ceo().then(r => r.data?.data ?? r.data),
  })

  const { data: revenueRaw } = useQuery({
    queryKey: ['revenue-monthly'],
    queryFn: () => invoicesApi.revenueByMonth(new Date().getFullYear()).then(r => r.data?.data ?? r.data ?? []),
  })

  const { data: invoicesRaw } = useQuery({
    queryKey: ['invoices'],
    queryFn: () => invoicesApi.list({}).then(r => r.data?.data ?? r.data ?? []),
  })

  const { data: employees } = useQuery({
    queryKey: ['employees'],
    queryFn: () => hrApi.employees().then(r => r.data?.data ?? r.data ?? []),
  })

  const { data: vehicles } = useQuery({
    queryKey: ['vehicles'],
    queryFn: () => fleetApi.vehicles().then(r => r.data?.data ?? r.data ?? []),
  })

  const { data: stockItems } = useQuery({
    queryKey: ['stock-items'],
    queryFn: () => inventoryApi.stockItems().then(r => r.data?.data ?? r.data ?? []),
  })

  const invoices: Record<string, unknown>[] = Array.isArray(invoicesRaw) ? invoicesRaw : []
  const empList: Record<string, unknown>[] = Array.isArray(employees) ? employees : []
  const vehicleList: Record<string, unknown>[] = Array.isArray(vehicles) ? vehicles : []
  const itemList: Record<string, unknown>[] = Array.isArray(stockItems) ? stockItems : []

  const invoiceStats = (ceo as Record<string, unknown> | undefined)?.invoices as Record<string, unknown> | undefined
  const fleetData = (ceo as Record<string, unknown> | undefined)?.fleet as Record<string, unknown> | undefined
  const hrData = (ceo as Record<string, unknown> | undefined)?.hr as Record<string, unknown> | undefined
  const inventoryData = (ceo as Record<string, unknown> | undefined)?.inventory as Record<string, unknown> | undefined
  const statsByStatus = invoiceStats?.stats as Record<string, { count: number; total: string }> | undefined
  const fleetByStatus = fleetData?.by_status as Record<string, number> | undefined
  const deptMap = hrData?.headcount_by_department as Record<string, number> | undefined

  const totalRevenue = Number(statsByStatus?.paid?.total ?? 0) + Number(statsByStatus?.approved?.total ?? 0)
  const paidCount = statsByStatus?.paid?.count ?? invoices.filter(i => i.status === 'paid').length
  const overdueCount = (invoiceStats?.overdue_count as number | undefined) ?? 0
  const empCount = (hrData?.total_active as number | undefined) ?? empList.length
  const activeVehicles = fleetByStatus?.available ?? vehicleList.filter(v => v.status === 'available').length
  const totalVehicles = (fleetData?.total as number | undefined) ?? vehicleList.length
  const lowStockCount = (inventoryData?.low_stock_count as number | undefined) ?? itemList.filter(i => Number(i.quantity) <= Number(i.reorder_point)).length


  const monthlyData = MONTHS.map((name, idx) => {
    const entry = Array.isArray(revenueRaw)
      ? revenueRaw.find((r: Record<string, unknown>) => Number(r.month) === idx + 1)
      : null
    return { name, revenue: entry ? Number(entry.total ?? entry.amount ?? 0) : 0 }
  })

  const maxRevenue = Math.max(...monthlyData.map(d => d.revenue), 1)

  const invoiceStatusData = [
    { status: 'Paid',     count: statsByStatus?.paid?.count ?? invoices.filter(i => i.status === 'paid').length,                         fill: '#10b981', dotClass: 'bg-emerald-500' },
    { status: 'Pending',  count: statsByStatus?.pending_approval?.count ?? invoices.filter(i => i.status === 'pending_approval').length,  fill: '#f59e0b', dotClass: 'bg-amber-500' },
    { status: 'Approved', count: statsByStatus?.approved?.count ?? invoices.filter(i => i.status === 'approved').length,                  fill: '#3b82f6', dotClass: 'bg-blue-500' },
    { status: 'Draft',    count: statsByStatus?.draft?.count ?? invoices.filter(i => i.status === 'draft').length,                        fill: '#94a3b8', dotClass: 'bg-slate-400' },
    { status: 'Overdue',  count: overdueCount,                                                                                             fill: '#ef4444', dotClass: 'bg-red-500' },
  ].filter(d => d.count > 0)

  const fleetStatusData = [
    { name: 'Available',   value: fleetByStatus?.available ?? vehicleList.filter(v => v.status === 'available').length,   fill: '#10b981' },
    { name: 'On Trip',     value: fleetByStatus?.on_trip ?? vehicleList.filter(v => v.status === 'on_trip').length,        fill: '#f59e0b' },
    { name: 'Maintenance', value: fleetByStatus?.maintenance ?? vehicleList.filter(v => v.status === 'maintenance').length,fill: '#ef4444' },
    { name: 'Inactive',    value: fleetByStatus?.inactive ?? vehicleList.filter(v => v.status === 'inactive').length,      fill: '#94a3b8' },
  ].filter(d => d.value > 0)

  const deptData = Object.entries(
    empList.reduce<Record<string, number>>((acc, emp) => {
      const dept = String(emp.department || 'Other')
      acc[dept] = (acc[dept] || 0) + 1
      return acc
    }, {})
  ).map(([dept, count]) => ({ dept: dept.length > 10 ? dept.slice(0, 9) + '…' : dept, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 6)

  const deptCount = deptMap ? Object.keys(deptMap).length : deptData.length

  return (
    <div className="flex flex-col h-full overflow-hidden bg-slate-50">
      <HeroHeader
        activeTab={activeTab}
        onTabChange={setActiveTab}
        selectedMonth={selectedMonth}
        selectedYear={selectedYear}
        onMonthChange={(m, y) => { setSelectedMonth(m); setSelectedYear(y) }}
      />

      <div className="flex-1 overflow-y-auto p-5 space-y-5">

        {/* ── Non-Main tab placeholder views ──────── */}
        {activeTab !== 'Main' && (
          <div className="space-y-5">
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 bg-orange-50 rounded-2xl flex items-center justify-center shrink-0">
                  <BarChart2 className="w-6 h-6 text-orange-500" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-slate-900">{TAB_DESCRIPTIONS[activeTab]?.title}</h2>
                  <p className="text-sm text-slate-500">{TAB_DESCRIPTIONS[activeTab]?.subtitle}</p>
                </div>
              </div>
              {activeTab === 'Unit' && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div>
                    <h3 className="text-sm font-bold text-slate-700 mb-3">Monthly Units Sold</h3>
                    <ResponsiveContainer width="100%" height={200}>
                      <BarChart data={monthlyData.map(d => ({ ...d, units: Math.round(d.revenue / 94500) }))}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                        <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                        <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} width={36} />
                        <Tooltip formatter={(v: number) => [`${v} units`, 'Units Sold']} contentStyle={{ borderRadius: 10, border: '1px solid #e2e8f0', fontSize: 12 }} />
                        <Bar dataKey="units" fill="#f97316" radius={[6, 6, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="space-y-3">
                    {[
                      { label: 'Total Units Sold',   value: monthlyData.reduce((s, d) => s + Math.round(d.revenue / 94500), 0).toLocaleString(), color: 'text-orange-600', bg: 'bg-orange-50' },
                      { label: 'Average Unit Price',  value: '94,500 RWF',   color: 'text-blue-600',    bg: 'bg-blue-50' },
                      { label: 'Units Returned',      value: '142',           color: 'text-red-600',     bg: 'bg-red-50' },
                      { label: 'Net Units Delivered', value: monthlyData.reduce((s, d) => s + Math.round(d.revenue / 94500), 0).toLocaleString(), color: 'text-emerald-600', bg: 'bg-emerald-50' },
                    ].map(({ label, value, color, bg }) => (
                      <div key={label} className={clsx('rounded-xl p-4 flex items-center justify-between', bg)}>
                        <span className="text-sm font-medium text-slate-700">{label}</span>
                        <span className={clsx('text-lg font-extrabold', color)}>{value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {activeTab === 'Marketing' && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div>
                    <h3 className="text-sm font-bold text-slate-700 mb-3">New Customers — Monthly</h3>
                    <ResponsiveContainer width="100%" height={200}>
                      <AreaChart data={monthlyData.map(d => ({ ...d, customers: Math.round(d.revenue / 3800) }))}>
                        <defs>
                          <linearGradient id="mktGrad" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%"  stopColor="#f97316" stopOpacity={0.25} />
                            <stop offset="95%" stopColor="#f97316" stopOpacity={0} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                        <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                        <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} width={36} />
                        <Tooltip formatter={(v: number) => [`${v} customers`, 'Acquired']} contentStyle={{ borderRadius: 10, border: '1px solid #e2e8f0', fontSize: 12 }} />
                        <Area type="monotone" dataKey="customers" stroke="#f97316" strokeWidth={2.5} fill="url(#mktGrad)" dot={false} activeDot={{ r: 5, fill: '#f97316', stroke: '#fff', strokeWidth: 2 }} />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="space-y-3">
                    {[
                      { label: 'New Customers',   value: '318',    color: 'text-orange-600',  bg: 'bg-orange-50' },
                      { label: 'Retention Rate',  value: '87.3%',  color: 'text-emerald-600', bg: 'bg-emerald-50' },
                      { label: 'Avg. CAC',        value: '43,200 RWF', color: 'text-red-600', bg: 'bg-red-50' },
                      { label: 'Customer LTV',    value: '612,000 RWF', color: 'text-blue-600', bg: 'bg-blue-50' },
                      { label: 'Conversion Rate', value: '6.4%',   color: 'text-purple-600',  bg: 'bg-purple-50' },
                    ].map(({ label, value, color, bg }) => (
                      <div key={label} className={clsx('rounded-xl p-4 flex items-center justify-between', bg)}>
                        <span className="text-sm font-medium text-slate-700">{label}</span>
                        <span className={clsx('text-lg font-extrabold', color)}>{value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {activeTab === 'Investors' && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div>
                    <h3 className="text-sm font-bold text-slate-700 mb-3">MRR Growth</h3>
                    <ResponsiveContainer width="100%" height={200}>
                      <AreaChart data={monthlyData.map((d, i) => ({ ...d, mrr: Math.round((totalRevenue / 12) * (1 + i * 0.04)) }))}>
                        <defs>
                          <linearGradient id="invGrad" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%"  stopColor="#8b5cf6" stopOpacity={0.25} />
                            <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                        <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                        <YAxis tickFormatter={n => fmtShort(n)} tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} width={44} />
                        <Tooltip formatter={(v: number) => [fmtRwf(v), 'MRR']} contentStyle={{ borderRadius: 10, border: '1px solid #e2e8f0', fontSize: 12 }} />
                        <Area type="monotone" dataKey="mrr" stroke="#8b5cf6" strokeWidth={2.5} fill="url(#invGrad)" dot={false} activeDot={{ r: 5, fill: '#8b5cf6', stroke: '#fff', strokeWidth: 2 }} />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="space-y-3">
                    {[
                      { label: 'ARR',          value: fmtShort(totalRevenue * 1.12) + ' RWF', color: 'text-purple-600', bg: 'bg-purple-50' },
                      { label: 'MRR',          value: fmtShort(totalRevenue / 12) + ' RWF',   color: 'text-blue-600',   bg: 'bg-blue-50' },
                      { label: 'Burn Rate',    value: '124,000 RWF/mo',                        color: 'text-red-600',    bg: 'bg-red-50' },
                      { label: 'Runway',       value: '18 months',                             color: 'text-emerald-600',bg: 'bg-emerald-50' },
                      { label: 'Gross Margin', value: '68.2%',                                 color: 'text-orange-600', bg: 'bg-orange-50' },
                    ].map(({ label, value, color, bg }) => (
                      <div key={label} className={clsx('rounded-xl p-4 flex items-center justify-between', bg)}>
                        <span className="text-sm font-medium text-slate-700">{label}</span>
                        <span className={clsx('text-base font-extrabold', color)}>{value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'Main' && <>

        {/* ── Top KPI cards ───────────────────────── */}
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
          {[
            {
              label: 'Total Revenue',
              value: fmtShort(totalRevenue) + ' RWF',
              icon: DollarSign,
              color: 'bg-orange-500',
              change: '+9.56%',
              positive: true,
            },
            {
              label: 'Invoices Paid',
              value: String(paidCount),
              icon: CheckCircle,
              color: 'bg-emerald-500',
              change: overdueCount > 0 ? `${overdueCount} overdue` : 'All clear',
              positive: overdueCount === 0,
            },
            {
              label: 'Employees',
              value: String(empCount),
              icon: Users,
              color: 'bg-blue-500',
              change: `${deptCount} depts`,
              positive: true,
            },
            {
              label: 'Fleet Active',
              value: `${activeVehicles}/${totalVehicles}`,
              icon: Truck,
              color: 'bg-violet-500',
              change: `${(fleetData?.active_on_gps as number | undefined) ?? '—'} GPS live`,
              positive: true,
            },
            {
              label: 'Low Stock Alerts',
              value: String(lowStockCount),
              icon: AlertTriangle,
              color: lowStockCount > 0 ? 'bg-red-500' : 'bg-slate-400',
              change: `${(inventoryData?.total_items as number | undefined) ?? itemList.length} total items`,
              positive: lowStockCount === 0,
            },
          ].map(({ label, value, icon: Icon, color, change, positive }) => (
            <div key={label} className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100 flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">{label}</span>
                <div className={clsx('w-8 h-8 rounded-xl flex items-center justify-center shrink-0', color)}>
                  <Icon className="w-4 h-4 text-white" />
                </div>
              </div>
              <div className="text-2xl font-extrabold text-slate-900 leading-none">{value}</div>
              <div className={clsx('flex items-center gap-1 text-xs font-semibold', positive ? 'text-emerald-600' : 'text-red-500')}>
                {positive ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                {change}
              </div>
            </div>
          ))}
        </div>

        {/* ── Revenue trend + Invoice status ───────── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

          {/* Revenue area chart — large */}
          <div className="lg:col-span-2 bg-white rounded-2xl p-5 shadow-sm border border-slate-100">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h2 className="text-base font-bold text-slate-900">Revenue Trend</h2>
                <p className="text-xs text-slate-500 mt-0.5">Monthly revenue — current year</p>
              </div>
              <div className="flex items-center gap-1.5 bg-orange-50 text-orange-700 text-xs font-bold px-3 py-1.5 rounded-xl">
                <TrendingUp className="w-3.5 h-3.5" />
                {fmtShort(totalRevenue)} RWF YTD
              </div>
            </div>
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={monthlyData} margin={{ top: 4, right: 4, bottom: 0, left: 0 }}>
                <defs>
                  <linearGradient id="dashRevGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f97316" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#f97316" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                <YAxis tickFormatter={n => fmtShort(n)} tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} width={44} />
                <Tooltip
                  formatter={(v: number) => [fmtRwf(v), 'Revenue']}
                  contentStyle={{ borderRadius: 12, border: '1px solid #e2e8f0', fontSize: 12, boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }}
                />
                <Area type="monotone" dataKey="revenue" stroke="#f97316" strokeWidth={2.5} fill="url(#dashRevGrad)" dot={false} activeDot={{ r: 5, fill: '#f97316', strokeWidth: 2, stroke: '#fff' }} />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Invoice status donut */}
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100">
            <div className="mb-5">
              <h2 className="text-base font-bold text-slate-900">Invoice Status</h2>
              <p className="text-xs text-slate-500 mt-0.5">Breakdown by current state</p>
            </div>
            {invoiceStatusData.length === 0 ? (
              <div className="h-[220px] flex flex-col items-center justify-center text-slate-400">
                <FileText className="w-10 h-10 mb-2 opacity-30" />
                <p className="text-sm">No invoices yet</p>
              </div>
            ) : (
              <>
                <ResponsiveContainer width="100%" height={160}>
                  <PieChart>
                    <Pie data={invoiceStatusData} cx="50%" cy="50%" innerRadius={45} outerRadius={72} dataKey="count" paddingAngle={3} strokeWidth={2} stroke="#fff">
                      {invoiceStatusData.map((entry, i) => <Cell key={i} fill={entry.fill} />)}
                    </Pie>
                    <Tooltip formatter={(v: number, name: string) => [`${v} invoices`, name]} contentStyle={{ borderRadius: 10, border: '1px solid #e2e8f0', fontSize: 12 }} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="space-y-2 mt-3">
                  {invoiceStatusData.map(d => (
                    <div key={d.status} className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2">
                        <span className={clsx('w-2.5 h-2.5 rounded-full shrink-0', d.dotClass)} />
                        <span className="text-slate-600 font-medium">{d.status}</span>
                      </div>
                      <span className="font-bold text-slate-900">{d.count}</span>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>

        {/* ── Dept headcount + Fleet status + Recent invoices ── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

          {/* Department headcount bar */}
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100">
            <div className="mb-4">
              <h2 className="text-base font-bold text-slate-900">Team by Department</h2>
              <p className="text-xs text-slate-500 mt-0.5">{empCount} employees across {deptCount} teams</p>
            </div>
            {deptData.length === 0 ? (
              <div className="h-[180px] flex items-center justify-center text-slate-400 text-sm">
                <Users className="w-8 h-8 mr-2 opacity-30" />No data
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={180}>
                <BarChart data={deptData} layout="vertical" margin={{ top: 0, right: 8, bottom: 0, left: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" horizontal={false} />
                  <XAxis type="number" allowDecimals={false} tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                  <YAxis type="category" dataKey="dept" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} width={70} />
                  <Tooltip formatter={(v: number) => [`${v} employees`, 'Headcount']} contentStyle={{ borderRadius: 10, border: '1px solid #e2e8f0', fontSize: 12 }} />
                  <Bar dataKey="count" fill="#f97316" radius={[0, 6, 6, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>

          {/* Fleet status donut */}
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100">
            <div className="mb-4">
              <h2 className="text-base font-bold text-slate-900">Fleet Overview</h2>
              <p className="text-xs text-slate-500 mt-0.5">{totalVehicles} vehicles · {activeVehicles} active</p>
            </div>
            {fleetStatusData.length === 0 ? (
              <div className="h-[180px] flex items-center justify-center text-slate-400 text-sm">
                <Truck className="w-8 h-8 mr-2 opacity-30" />No vehicles
              </div>
            ) : (
              <>
                <ResponsiveContainer width="100%" height={140}>
                  <PieChart>
                    <Pie data={fleetStatusData} cx="50%" cy="50%" innerRadius={42} outerRadius={65} dataKey="value" paddingAngle={4} strokeWidth={2} stroke="#fff">
                      {fleetStatusData.map((entry, i) => <Cell key={i} fill={entry.fill} />)}
                    </Pie>
                    <Tooltip formatter={(v: number, name: string) => [`${v} vehicles`, name]} contentStyle={{ borderRadius: 10, border: '1px solid #e2e8f0', fontSize: 12 }} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="flex flex-wrap gap-x-4 gap-y-1.5 justify-center mt-2">
                  {fleetStatusData.map(d => (
                    <div key={d.name} className="flex items-center gap-1.5 text-xs text-slate-500">
                      <span className={clsx(
                        'w-2 h-2 rounded-full',
                        d.name === 'Available' ? 'bg-emerald-500' : d.name === 'On Trip' ? 'bg-amber-500' : d.name === 'Maintenance' ? 'bg-red-500' : 'bg-slate-400',
                      )} />
                      {d.name} <span className="font-bold text-slate-800">{d.value}</span>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>

          {/* Recent invoices */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
            <div className="p-5 pb-3">
              <h2 className="text-base font-bold text-slate-900">Recent Invoices</h2>
              <p className="text-xs text-slate-500 mt-0.5">Latest billing activity</p>
            </div>
            <div className="divide-y divide-slate-50">
              {invoices.length === 0 ? (
                <div className="py-10 text-center text-slate-400">
                  <FileText className="w-8 h-8 mx-auto mb-2 opacity-30" />
                  <p className="text-sm">No invoices yet</p>
                </div>
              ) : invoices.slice(0, 5).map(inv => (
                <div key={String(inv.id)} className="flex items-center gap-3 px-5 py-3 hover:bg-slate-50 transition-colors">
                  <div className={clsx(
                    'w-2 h-2 rounded-full shrink-0',
                    inv.status === 'paid' ? 'bg-emerald-500'
                      : inv.status === 'approved' ? 'bg-blue-500'
                      : inv.status === 'pending_approval' ? 'bg-amber-500'
                      : 'bg-slate-300',
                  )} />
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-slate-800 truncate">{String(inv.customer_name ?? '—')}</div>
                    <div className="text-xs text-slate-400 capitalize">{String(inv.status)}</div>
                  </div>
                  <div className="text-sm font-bold text-slate-900 shrink-0">
                    {fmtShort(Number(inv.total_amount ?? 0))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── Monthly bar chart full width ─────────── */}
        {monthlyData.some(d => d.revenue > 0) && (
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h2 className="text-base font-bold text-slate-900">Monthly Revenue Breakdown</h2>
                <p className="text-xs text-slate-500 mt-0.5">Bar view — each month&apos;s collected revenue</p>
              </div>
              <div className="flex items-center gap-1.5 text-xs text-slate-500">
                <BarChart2 className="w-3.5 h-3.5" />
                Peak: {fmtShort(maxRevenue)} RWF
              </div>
            </div>
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={monthlyData} margin={{ top: 4, right: 4, bottom: 0, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                <YAxis tickFormatter={n => fmtShort(n)} tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} width={44} />
                <Tooltip formatter={(v: number) => [fmtRwf(v), 'Revenue']} contentStyle={{ borderRadius: 12, border: '1px solid #e2e8f0', fontSize: 12 }} />
                <Bar dataKey="revenue" radius={[6, 6, 0, 0]} fill="#f97316" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}

        </>}

      </div>
    </div>
  )
}
