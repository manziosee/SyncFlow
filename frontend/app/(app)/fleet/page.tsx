'use client'

import { useEffect, useState, useCallback } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { fleetApi } from '@/lib/api'
import { useAuth } from '@/lib/auth-context'
import { joinChannel, leaveChannel } from '@/lib/socket'
import PageHeroHeader, { HeroButton } from '@/components/dashboard/PageHeroHeader'
import {
  Truck, Fuel, MapPin, Plus, Search, Loader2,
  RefreshCw, X, Activity, Navigation, Clock,
  Eye, Edit2, Trash2,
} from 'lucide-react'
import toast from 'react-hot-toast'
import clsx from 'clsx'
import {
  BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
  AreaChart, Area,
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

const STATUS_BADGE: Record<string, string> = {
  active: 'badge-green',
  idle: 'badge-yellow',
  maintenance: 'badge-red',
  retired: 'badge-gray',
}

const STATUS_FILL: Record<string, string> = {
  active: '#10b981',
  idle: '#f59e0b',
  maintenance: '#ef4444',
  retired: '#94a3b8',
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
    <button type="button" onClick={onClick} disabled={disabled}
      className={clsx('inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border text-xs font-medium transition-all disabled:opacity-40', styles[variant])}>
      <Icon className="w-3.5 h-3.5" />
      {label}
    </button>
  )
}

interface Vehicle {
  id: string; plate: string; make: string; model: string; year: number
  status: string; driver_name?: string; driver_id?: string
  current_lat?: number; current_lng?: number; last_seen?: string; fuel_type?: string
}

interface FuelRecord {
  id: string; vehicle_id: string; liters: number; cost: number; odometer: number; filled_at: string
}

interface LivePosition {
  vehicle_id: string; plate: string; lat: number; lng: number; speed: number; heading: number; timestamp: string
}

function AddVehicleModal({ onClose }: { onClose: () => void }) {
  const qc = useQueryClient()
  const [form, setForm] = useState({ plate: '', make: '', model: '', year: new Date().getFullYear(), fuel_type: 'petrol', status: 'idle' })

  const mutation = useMutation({
    mutationFn: () => fleetApi.createVehicle(form as Record<string, unknown>),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['vehicles'] }); toast.success('Vehicle added'); onClose() },
    onError: () => toast.error('Failed to add vehicle'),
  })

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl">
        <div className="flex items-center justify-between mb-5">
          <h3 className="font-bold text-ink text-base">Add Vehicle</h3>
          <button type="button" onClick={onClose} aria-label="Close"><X className="w-4 h-4 text-ink-muted hover:text-ink" /></button>
        </div>
        <div className="space-y-3">
          <div>
            <label htmlFor="v-plate" className="block text-xs font-medium text-ink-secondary mb-1">License Plate</label>
            <input id="v-plate" className="input" value={form.plate} onChange={e => setForm(f => ({ ...f, plate: e.target.value }))} placeholder="RAA 000 A" required />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label htmlFor="v-make" className="block text-xs font-medium text-ink-secondary mb-1">Make</label>
              <input id="v-make" className="input" value={form.make} onChange={e => setForm(f => ({ ...f, make: e.target.value }))} placeholder="Toyota" />
            </div>
            <div>
              <label htmlFor="v-model" className="block text-xs font-medium text-ink-secondary mb-1">Model</label>
              <input id="v-model" className="input" value={form.model} onChange={e => setForm(f => ({ ...f, model: e.target.value }))} placeholder="Hilux" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label htmlFor="v-year" className="block text-xs font-medium text-ink-secondary mb-1">Year</label>
              <input id="v-year" className="input" type="number" value={form.year} onChange={e => setForm(f => ({ ...f, year: Number(e.target.value) }))} />
            </div>
            <div>
              <label htmlFor="v-fuel" className="block text-xs font-medium text-ink-secondary mb-1">Fuel Type</label>
              <select id="v-fuel" className="input" value={form.fuel_type} onChange={e => setForm(f => ({ ...f, fuel_type: e.target.value }))}>
                {['petrol', 'diesel', 'electric', 'hybrid'].map(t => <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>)}
              </select>
            </div>
          </div>
        </div>
        <div className="flex gap-2 mt-5">
          <button type="button" onClick={onClose} className="btn-ghost flex-1">Cancel</button>
          <button type="button" onClick={() => mutation.mutate()} disabled={!form.plate || mutation.isPending} className="btn-primary flex-1 gap-2">
            {mutation.isPending && <Loader2 className="w-4 h-4 animate-spin" />}Add Vehicle
          </button>
        </div>
      </div>
    </div>
  )
}

function LogFuelModal({ vehicles, onClose }: { vehicles: Vehicle[]; onClose: () => void }) {
  const qc = useQueryClient()
  const [form, setForm] = useState({
    vehicle_id: vehicles[0]?.id ?? '', liters: 0, cost: 0, odometer: 0,
    filled_at: new Date().toISOString().split('T')[0],
  })

  const mutation = useMutation({
    mutationFn: () => fleetApi.logFuel(form as Record<string, unknown>),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['fuel-records'] }); toast.success('Fuel logged'); onClose() },
    onError: () => toast.error('Failed to log fuel'),
  })

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-2xl">
        <div className="flex items-center justify-between mb-5">
          <h3 className="font-bold text-ink text-base">Log Fuel Refill</h3>
          <button type="button" onClick={onClose} aria-label="Close"><X className="w-4 h-4 text-ink-muted hover:text-ink" /></button>
        </div>
        <div className="space-y-3">
          <div>
            <label htmlFor="fuel-vehicle" className="block text-xs font-medium text-ink-secondary mb-1">Vehicle</label>
            <select id="fuel-vehicle" className="input" value={form.vehicle_id} onChange={e => setForm(f => ({ ...f, vehicle_id: e.target.value }))}>
              {vehicles.map(v => <option key={v.id} value={v.id}>{v.plate} — {v.make} {v.model}</option>)}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label htmlFor="fuel-liters" className="block text-xs font-medium text-ink-secondary mb-1">Liters</label>
              <input id="fuel-liters" className="input" type="number" min="0" step="0.1" placeholder="0.0" value={form.liters} onChange={e => setForm(f => ({ ...f, liters: Number(e.target.value) }))} />
            </div>
            <div>
              <label htmlFor="fuel-cost" className="block text-xs font-medium text-ink-secondary mb-1">Cost (RWF)</label>
              <input id="fuel-cost" className="input" type="number" min="0" placeholder="0" value={form.cost} onChange={e => setForm(f => ({ ...f, cost: Number(e.target.value) }))} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label htmlFor="fuel-odo" className="block text-xs font-medium text-ink-secondary mb-1">Odometer (km)</label>
              <input id="fuel-odo" className="input" type="number" min="0" placeholder="0" value={form.odometer} onChange={e => setForm(f => ({ ...f, odometer: Number(e.target.value) }))} />
            </div>
            <div>
              <label htmlFor="fuel-date" className="block text-xs font-medium text-ink-secondary mb-1">Date</label>
              <input id="fuel-date" className="input" type="date" value={form.filled_at} onChange={e => setForm(f => ({ ...f, filled_at: e.target.value }))} />
            </div>
          </div>
        </div>
        <div className="flex gap-2 mt-5">
          <button type="button" onClick={onClose} className="btn-ghost flex-1">Cancel</button>
          <button type="button" onClick={() => mutation.mutate()} disabled={!form.vehicle_id || mutation.isPending} className="btn-primary flex-1 gap-2">
            {mutation.isPending && <Loader2 className="w-4 h-4 animate-spin" />}Log Fuel
          </button>
        </div>
      </div>
    </div>
  )
}

export default function FleetPage() {
  const { token } = useAuth() as { token: string | null }
  const [tab, setTab] = useState<'vehicles' | 'live' | 'fuel'>('vehicles')
  const [search, setSearch] = useState('')
  const [showAdd, setShowAdd] = useState(false)
  const [showFuel, setShowFuel] = useState(false)
  const [livePositions, setLivePositions] = useState<Record<string, LivePosition>>({})

  const { data: vehicleData, isLoading, refetch } = useQuery({
    queryKey: ['vehicles', search],
    queryFn: () => fleetApi.vehicles(search ? { search } : undefined).then(r => r.data?.data ?? r.data ?? []),
  })

  const { data: summary } = useQuery({
    queryKey: ['fleet-summary'],
    queryFn: () => fleetApi.summary().then(r => r.data),
  })

  const { data: fuelData, isLoading: fuelLoading } = useQuery({
    queryKey: ['fuel-records', vehicleData?.[0]?.id],
    queryFn: () => vehicleData?.[0]?.id
      ? fleetApi.fuelRecords(vehicleData[0].id).then(r => r.data?.data ?? r.data ?? [])
      : Promise.resolve([]),
    enabled: tab === 'fuel' && !!vehicleData?.length,
  })

  const handlePosition = useCallback((payload: LivePosition) => {
    setLivePositions(prev => ({ ...prev, [payload.vehicle_id]: payload }))
  }, [])

  useEffect(() => {
    if (!token) return
    const ch = joinChannel('fleet:live', token)
    ch.on('vehicle_location', handlePosition)
    return () => { leaveChannel(ch) }
  }, [token, handlePosition])

  useEffect(() => {
    if (tab === 'live') {
      fleetApi.livePositions().then(r => {
        const pos: Record<string, LivePosition> = {}
        const data: LivePosition[] = r.data?.data ?? r.data ?? []
        data.forEach((p: LivePosition) => { pos[p.vehicle_id] = p })
        setLivePositions(pos)
      }).catch(() => {})
    }
  }, [tab])

  const vehicles: Vehicle[] = vehicleData ?? []
  const allFuelRecords: FuelRecord[] = fuelData ?? []

  const activeCount = vehicles.filter(v => v.status === 'active').length
  const liveCount = Object.keys(livePositions).length

  const statusPieData = ['active', 'idle', 'maintenance', 'retired']
    .map(s => ({ name: s.charAt(0).toUpperCase() + s.slice(1), value: vehicles.filter(v => v.status === s).length, fill: STATUS_FILL[s] }))
    .filter(d => d.value > 0)

  const fuelByVehicle = vehicles.map(v => ({
    plate: v.plate.length > 8 ? v.plate.slice(0, 8) : v.plate,
    cost: allFuelRecords.filter(r => r.vehicle_id === v.id).reduce((s, r) => s + r.cost, 0),
    liters: allFuelRecords.filter(r => r.vehicle_id === v.id).reduce((s, r) => s + r.liters, 0),
  })).filter(d => d.cost > 0)

  const totalFuelCost = allFuelRecords.reduce((s, r) => s + r.cost, 0)

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <PageHeroHeader
        title="Fleet Management"
        highlight="Fleet"
        subtitle="Vehicles, live GPS tracking & fuel records"
        imageIndex={4}
        stats={[
          { label: 'vehicles', value: vehicles.length },
          { label: 'active', value: activeCount, positive: true },
          { label: 'live GPS', value: liveCount },
        ]}
        actions={
          <HeroButton variant="orange" onClick={() => setShowAdd(true)}>
            <Plus className="w-3.5 h-3.5" />Add Vehicle
          </HeroButton>
        }
      />

      <div className="flex-1 overflow-y-auto p-6 space-y-5">

        {/* ── KPI strip ─────────────────────────── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {[
            { label: 'Total Vehicles',  value: vehicles.length,                                                   icon: Truck,      color: 'bg-orange-50 text-orange-600' },
            { label: 'Active on Road',  value: activeCount,                                                       icon: Activity,   color: 'bg-emerald-50 text-emerald-600' },
            { label: 'GPS Tracking',    value: liveCount,                                                         icon: Navigation, color: 'bg-blue-50 text-blue-600' },
            { label: 'Fuel Cost (MTD)', value: summary?.total_fuel_cost ? fmtRwfShort(summary.total_fuel_cost) + ' RWF' : '—', icon: Fuel, color: 'bg-amber-50 text-amber-600' },
          ].map(({ label, value, icon: Icon, color }) => (
            <div key={label} className="card p-4 flex items-center gap-3">
              <div className={clsx('w-10 h-10 rounded-xl flex items-center justify-center shrink-0', color)}>
                <Icon className="w-5 h-5" />
              </div>
              <div>
                <div className="text-xl font-extrabold text-ink">{String(value)}</div>
                <div className="text-xs text-ink-muted font-medium">{label}</div>
              </div>
            </div>
          ))}
        </div>

        {/* ── Charts row ────────────────────────── */}
        {vehicles.length > 0 && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

            {/* Vehicle status donut */}
            <div className="card p-5">
              <div className="mb-4">
                <h3 className="text-sm font-bold text-ink">Fleet Status Overview</h3>
                <p className="text-xs text-ink-muted">Active · Idle · Maintenance · Retired</p>
              </div>
              <div className="flex items-center gap-4">
                <ResponsiveContainer width="50%" height={140}>
                  <PieChart>
                    <Pie data={statusPieData} cx="50%" cy="50%" innerRadius={35} outerRadius={60} dataKey="value" paddingAngle={3}>
                      {statusPieData.map((entry, i) => <Cell key={i} fill={entry.fill} />)}
                    </Pie>
                    <Tooltip formatter={(v: number, name: string) => [`${v} vehicles`, name]} contentStyle={{ borderRadius: 10, border: '1px solid #e2e8f0', fontSize: 12 }} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="flex-1 space-y-2">
                  {statusPieData.map(d => (
                    <div key={d.name} className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2 text-ink-secondary">
                        <span className={clsx(
                          'w-2.5 h-2.5 rounded-full shrink-0',
                          d.name === 'Active' ? 'bg-emerald-500'
                            : d.name === 'Idle' ? 'bg-amber-500'
                            : d.name === 'Maintenance' ? 'bg-red-500'
                            : 'bg-slate-400',
                        )} />
                        {d.name}
                      </div>
                      <span className="font-bold text-ink">{d.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Fuel cost trend */}
            <div className="card p-5">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-sm font-bold text-ink">Fuel Cost by Vehicle</h3>
                  <p className="text-xs text-ink-muted">Total recorded fuel expenditure</p>
                </div>
                {totalFuelCost > 0 && (
                  <span className="text-xs font-semibold text-amber-700 bg-amber-50 px-2.5 py-1 rounded-lg">
                    {fmtRwfShort(totalFuelCost)} total
                  </span>
                )}
              </div>
              {fuelByVehicle.length === 0 ? (
                <div className="h-[140px] flex items-center justify-center text-sm text-ink-muted">
                  <Fuel className="w-6 h-6 mr-2 opacity-30" />No fuel records yet
                </div>
              ) : (
                <ResponsiveContainer width="100%" height={150}>
                  <BarChart data={fuelByVehicle} margin={{ top: 0, right: 4, bottom: 0, left: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis dataKey="plate" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                    <YAxis tickFormatter={fmtRwfShort} tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} tickLine={false} width={40} />
                    <Tooltip formatter={(v: number) => [fmtRwf(v), 'Fuel Cost']} contentStyle={{ borderRadius: 10, border: '1px solid #e2e8f0', fontSize: 12 }} />
                    <Bar dataKey="cost" fill="#f97316" radius={[5, 5, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>

          </div>
        )}

        {/* ── Tabs + actions ────────────────────── */}
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="flex bg-slate-100 rounded-xl p-1 gap-1">
            {(['vehicles', 'live', 'fuel'] as const).map(t => (
              <button key={t} type="button" onClick={() => setTab(t)}
                className={clsx('px-4 py-1.5 rounded-lg text-sm font-medium transition-all',
                  tab === t ? 'bg-white text-ink shadow-sm' : 'text-ink-muted hover:text-ink')}>
                {t === 'live' ? (
                  <span className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />Live GPS
                  </span>
                ) : t.charAt(0).toUpperCase() + t.slice(1)}
              </button>
            ))}
          </div>
          <div className="flex gap-2">
            {tab === 'vehicles' && (
              <>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-muted" />
                  <input className="input pl-9 w-48" placeholder="Search vehicles…" value={search} onChange={e => setSearch(e.target.value)} />
                </div>
                <button type="button" onClick={() => refetch()} aria-label="Refresh vehicles" className="btn-ghost">
                  <RefreshCw className={clsx('w-4 h-4', isLoading && 'animate-spin')} />
                </button>
                <button type="button" onClick={() => setShowAdd(true)} className="btn-primary gap-2">
                  <Plus className="w-4 h-4" />Add Vehicle
                </button>
              </>
            )}
            {tab === 'fuel' && (
              <button type="button" onClick={() => setShowFuel(true)} className="btn-primary gap-2">
                <Plus className="w-4 h-4" />Log Fuel
              </button>
            )}
          </div>
        </div>

        {/* ── Vehicles table ────────────────────── */}
        {tab === 'vehicles' && (
          <div className="card overflow-hidden">
            <table className="table">
              <thead>
                <tr>
                  <th>Vehicle</th>
                  <th>Assigned Driver</th>
                  <th>Status</th>
                  <th>Fuel Type</th>
                  <th>Last Seen</th>
                  <th>GPS</th>
                  <th className="text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <tr><td colSpan={7} className="text-center py-12"><Loader2 className="w-6 h-6 animate-spin mx-auto text-ink-muted" /></td></tr>
                ) : vehicles.length === 0 ? (
                  <tr><td colSpan={7} className="text-center py-12 text-ink-muted">
                    <Truck className="w-10 h-10 mx-auto mb-2 opacity-30" />
                    <p className="text-sm">No vehicles in fleet</p>
                    <p className="text-xs mt-1">Add your first vehicle to start tracking</p>
                  </td></tr>
                ) : vehicles.map(v => {
                  const live = livePositions[v.id]
                  return (
                    <tr key={v.id}>
                      <td>
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 bg-slate-100 rounded-lg flex items-center justify-center shrink-0">
                            <Truck className="w-4 h-4 text-ink-muted" />
                          </div>
                          <div>
                            <div className="font-mono font-bold text-ink">{v.plate}</div>
                            <div className="text-xs text-ink-muted">{v.make} {v.model} · {v.year}</div>
                          </div>
                        </div>
                      </td>
                      <td className="text-ink-secondary text-sm">
                        {v.driver_name || <span className="text-ink-muted italic">Unassigned</span>}
                      </td>
                      <td>
                        <span className={clsx('badge', STATUS_BADGE[v.status] ?? 'badge-gray')}>
                          {v.status.charAt(0).toUpperCase() + v.status.slice(1)}
                        </span>
                      </td>
                      <td className="text-ink-secondary text-sm capitalize">{v.fuel_type || '—'}</td>
                      <td className="text-ink-muted text-sm">{v.last_seen ? fmtDate(v.last_seen) : '—'}</td>
                      <td>
                        {live ? (
                          <span className="flex items-center gap-1.5 text-xs text-emerald-700 font-semibold">
                            <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                            Live · {live.speed} km/h
                          </span>
                        ) : (
                          <span className="text-xs text-ink-muted">Offline</span>
                        )}
                      </td>
                      <td>
                        <div className="flex items-center justify-end gap-1.5">
                          <ActionBtn variant="view" label="View" icon={Eye} onClick={() => toast('Vehicle detail coming soon')} />
                          <ActionBtn variant="edit" label="Edit" icon={Edit2} onClick={() => toast('Edit vehicle coming soon')} />
                          <ActionBtn variant="delete" label="Delete" icon={Trash2} onClick={() => toast.error('Delete not yet supported')} />
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* ── Live GPS panel ────────────────────── */}
        {tab === 'live' && (
          <div className="space-y-4">
            <div className="card p-5">
              <div className="flex items-center gap-2 mb-4">
                <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                <span className="text-sm font-semibold text-ink">{liveCount} vehicle{liveCount !== 1 ? 's' : ''} transmitting GPS</span>
              </div>
              <div className="bg-slate-900 rounded-xl h-64 flex items-center justify-center relative overflow-hidden">
                <div className="map-dot-grid absolute inset-0 opacity-[0.06]" />
                <div className="text-center z-10">
                  <MapPin className="w-10 h-10 text-orange-500 mx-auto mb-2" />
                  <p className="text-white text-sm font-semibold">Live GPS Map</p>
                  <p className="text-slate-400 text-xs mt-1">Connect Mapbox or Google Maps for live tracking</p>
                  {liveCount > 0 && (
                    <div className="mt-3 flex items-center justify-center gap-2">
                      <span className="w-2 h-2 bg-orange-500 rounded-full animate-pulse" />
                      <span className="text-orange-400 text-xs font-semibold">{liveCount} vehicle{liveCount !== 1 ? 's' : ''} online</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="card overflow-hidden">
              <table className="table">
                <thead>
                  <tr>
                    <th>Plate</th>
                    <th className="text-right">Speed</th>
                    <th>Coordinates</th>
                    <th>Last Update</th>
                  </tr>
                </thead>
                <tbody>
                  {Object.values(livePositions).length === 0 ? (
                    <tr><td colSpan={4} className="text-center py-8 text-ink-muted">
                      <Navigation className="w-8 h-8 mx-auto mb-2 opacity-30" />
                      <p className="text-sm">No live GPS data available</p>
                    </td></tr>
                  ) : Object.values(livePositions).map(pos => (
                    <tr key={pos.vehicle_id}>
                      <td className="font-mono font-bold text-ink">{pos.plate}</td>
                      <td className="text-right">
                        <span className={clsx('font-semibold', pos.speed > 0 ? 'text-orange-600' : 'text-ink-muted')}>
                          {pos.speed} km/h
                        </span>
                      </td>
                      <td className="text-xs text-ink-muted font-mono">{pos.lat.toFixed(4)}, {pos.lng.toFixed(4)}</td>
                      <td className="text-ink-muted text-sm">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />{new Date(pos.timestamp).toLocaleTimeString()}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ── Fuel records ──────────────────────── */}
        {tab === 'fuel' && (
          <div className="space-y-4">
            {fuelByVehicle.length > 0 && (
              <div className="card p-5">
                <h3 className="text-sm font-bold text-ink mb-4">Fuel Cost Trend</h3>
                <ResponsiveContainer width="100%" height={160}>
                  <AreaChart data={allFuelRecords.slice(-12).map(r => ({
                    date: new Date(r.filled_at).toLocaleDateString('en-RW', { day: '2-digit', month: 'short' }),
                    cost: r.cost,
                    liters: r.liters,
                  }))} margin={{ top: 4, right: 4, bottom: 0, left: 0 }}>
                    <defs>
                      <linearGradient id="fuelGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#f97316" stopOpacity={0.2} />
                        <stop offset="95%" stopColor="#f97316" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis dataKey="date" tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                    <YAxis tickFormatter={fmtRwfShort} tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} tickLine={false} width={40} />
                    <Tooltip formatter={(v: number) => [fmtRwf(v), 'Fuel Cost']} contentStyle={{ borderRadius: 10, border: '1px solid #e2e8f0', fontSize: 12 }} />
                    <Area type="monotone" dataKey="cost" stroke="#f97316" strokeWidth={2} fill="url(#fuelGrad)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            )}

            <div className="card overflow-hidden">
              <table className="table">
                <thead>
                  <tr>
                    <th>Vehicle</th>
                    <th className="text-right">Liters</th>
                    <th className="text-right">Cost</th>
                    <th className="text-right">Odometer</th>
                    <th>Date</th>
                  </tr>
                </thead>
                <tbody>
                  {fuelLoading ? (
                    <tr><td colSpan={5} className="text-center py-12"><Loader2 className="w-6 h-6 animate-spin mx-auto text-ink-muted" /></td></tr>
                  ) : allFuelRecords.length === 0 ? (
                    <tr><td colSpan={5} className="text-center py-12 text-ink-muted">
                      <Fuel className="w-10 h-10 mx-auto mb-2 opacity-30" />
                      <p className="text-sm">No fuel records yet</p>
                      <p className="text-xs mt-1">Log your first fuel refill to start tracking costs</p>
                    </td></tr>
                  ) : allFuelRecords.map(rec => (
                    <tr key={rec.id}>
                      <td className="font-mono font-semibold text-ink">
                        {vehicles.find(v => v.id === rec.vehicle_id)?.plate ?? rec.vehicle_id.slice(0, 8)}
                      </td>
                      <td className="text-right font-semibold text-ink">{rec.liters.toFixed(1)} L</td>
                      <td className="text-right text-ink-secondary">{fmtRwf(rec.cost)}</td>
                      <td className="text-right text-ink-muted text-sm">{rec.odometer.toLocaleString()} km</td>
                      <td className="text-ink-muted text-sm">{fmtDate(rec.filled_at)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

      </div>

      {showAdd && <AddVehicleModal onClose={() => setShowAdd(false)} />}
      {showFuel && <LogFuelModal vehicles={vehicles} onClose={() => setShowFuel(false)} />}
    </div>
  )
}
