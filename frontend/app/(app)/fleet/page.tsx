'use client'

import { useEffect, useState, useCallback } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { fleetApi } from '@/lib/api'
import { useAuth } from '@/lib/auth-context'
import { joinChannel, leaveChannel } from '@/lib/socket'
import PageHeroHeader, { HeroButton } from '@/components/dashboard/PageHeroHeader'
import {
  Truck, Fuel, MapPin, Plus, Search, Loader2,
  RefreshCw, X, Activity, Navigation, Clock
} from 'lucide-react'
import toast from 'react-hot-toast'
import clsx from 'clsx'

const fmtRwf = (n: number) =>
  new Intl.NumberFormat('en-RW', { maximumFractionDigits: 0 }).format(n) + ' RWF'

const fmtDate = (d: string) =>
  new Date(d).toLocaleDateString('en-RW', { day: '2-digit', month: 'short', year: 'numeric' })

const STATUS_COLORS: Record<string, string> = {
  active: 'badge-green',
  idle: 'badge-yellow',
  maintenance: 'badge-red',
  retired: 'badge-gray',
}

interface Vehicle {
  id: string
  plate: string
  make: string
  model: string
  year: number
  status: string
  driver_name?: string
  driver_id?: string
  current_lat?: number
  current_lng?: number
  last_seen?: string
  fuel_type?: string
}

interface FuelRecord {
  id: string
  vehicle_id: string
  liters: number
  cost: number
  odometer: number
  filled_at: string
}

interface LivePosition {
  vehicle_id: string
  plate: string
  lat: number
  lng: number
  speed: number
  heading: number
  timestamp: string
}

function AddVehicleModal({ onClose }: { onClose: () => void }) {
  const qc = useQueryClient()
  const [form, setForm] = useState({
    plate: '', make: '', model: '', year: new Date().getFullYear(),
    fuel_type: 'petrol', status: 'idle'
  })

  const mutation = useMutation({
    mutationFn: () => fleetApi.createVehicle(form as Record<string, unknown>),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['vehicles'] }); toast.success('Vehicle added'); onClose() },
    onError: () => toast.error('Failed to add vehicle'),
  })

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-ink">Add Vehicle</h3>
          <button onClick={onClose} className="text-ink-muted hover:text-ink"><X className="w-4 h-4" /></button>
        </div>
        <div className="space-y-3">
          <div>
            <label className="block text-xs font-medium text-ink-secondary mb-1">License Plate</label>
            <input className="input" value={form.plate} onChange={e => setForm(f => ({ ...f, plate: e.target.value }))}
              placeholder="RAA 000 A" required />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-ink-secondary mb-1">Make</label>
              <input className="input" value={form.make} onChange={e => setForm(f => ({ ...f, make: e.target.value }))} placeholder="Toyota" />
            </div>
            <div>
              <label className="block text-xs font-medium text-ink-secondary mb-1">Model</label>
              <input className="input" value={form.model} onChange={e => setForm(f => ({ ...f, model: e.target.value }))} placeholder="Hilux" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-ink-secondary mb-1">Year</label>
              <input className="input" type="number" value={form.year} onChange={e => setForm(f => ({ ...f, year: Number(e.target.value) }))} />
            </div>
            <div>
              <label className="block text-xs font-medium text-ink-secondary mb-1">Fuel Type</label>
              <select className="input" value={form.fuel_type} onChange={e => setForm(f => ({ ...f, fuel_type: e.target.value }))}>
                {['petrol', 'diesel', 'electric', 'hybrid'].map(t => <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>)}
              </select>
            </div>
          </div>
        </div>
        <div className="flex gap-2 mt-4">
          <button onClick={onClose} className="btn-ghost flex-1">Cancel</button>
          <button onClick={() => mutation.mutate()} disabled={!form.plate || mutation.isPending} className="btn-primary flex-1 gap-2">
            {mutation.isPending && <Loader2 className="w-4 h-4 animate-spin" />}
            Add Vehicle
          </button>
        </div>
      </div>
    </div>
  )
}

function LogFuelModal({ vehicles, onClose }: { vehicles: Vehicle[]; onClose: () => void }) {
  const qc = useQueryClient()
  const [form, setForm] = useState({
    vehicle_id: vehicles[0]?.id ?? '',
    liters: 0, cost: 0, odometer: 0,
    filled_at: new Date().toISOString().split('T')[0]
  })

  const mutation = useMutation({
    mutationFn: () => fleetApi.logFuel(form as Record<string, unknown>),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['fuel-records'] }); toast.success('Fuel logged'); onClose() },
    onError: () => toast.error('Failed to log fuel'),
  })

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-2xl">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-ink">Log Fuel</h3>
          <button onClick={onClose} className="text-ink-muted hover:text-ink"><X className="w-4 h-4" /></button>
        </div>
        <div className="space-y-3">
          <div>
            <label className="block text-xs font-medium text-ink-secondary mb-1">Vehicle</label>
            <select className="input" value={form.vehicle_id} onChange={e => setForm(f => ({ ...f, vehicle_id: e.target.value }))}>
              {vehicles.map(v => <option key={v.id} value={v.id}>{v.plate} — {v.make} {v.model}</option>)}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-ink-secondary mb-1">Liters</label>
              <input className="input" type="number" min="0" step="0.1" value={form.liters}
                onChange={e => setForm(f => ({ ...f, liters: Number(e.target.value) }))} />
            </div>
            <div>
              <label className="block text-xs font-medium text-ink-secondary mb-1">Cost (RWF)</label>
              <input className="input" type="number" min="0" value={form.cost}
                onChange={e => setForm(f => ({ ...f, cost: Number(e.target.value) }))} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-ink-secondary mb-1">Odometer (km)</label>
              <input className="input" type="number" min="0" value={form.odometer}
                onChange={e => setForm(f => ({ ...f, odometer: Number(e.target.value) }))} />
            </div>
            <div>
              <label className="block text-xs font-medium text-ink-secondary mb-1">Date</label>
              <input className="input" type="date" value={form.filled_at}
                onChange={e => setForm(f => ({ ...f, filled_at: e.target.value }))} />
            </div>
          </div>
        </div>
        <div className="flex gap-2 mt-4">
          <button onClick={onClose} className="btn-ghost flex-1">Cancel</button>
          <button onClick={() => mutation.mutate()} disabled={!form.vehicle_id || mutation.isPending} className="btn-primary flex-1 gap-2">
            {mutation.isPending && <Loader2 className="w-4 h-4 animate-spin" />}
            Log Fuel
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
            <Plus className="w-3.5 h-3.5" />
            Add Vehicle
          </HeroButton>
        }
      />
      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        {/* KPI strip */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {[
            { label: 'Total Vehicles', value: vehicles.length, icon: Truck, color: 'bg-primary-100 text-primary-600' },
            { label: 'Active', value: activeCount, icon: Activity, color: 'bg-success-bg text-success' },
            { label: 'GPS Tracking', value: liveCount, icon: Navigation, color: 'bg-blue-100 text-blue-600' },
            { label: 'Fuel Cost (MTD)', value: summary?.total_fuel_cost ? fmtRwf(summary.total_fuel_cost) : '—', icon: Fuel, color: 'bg-orange-100 text-orange-600' },
          ].map(({ label, value, icon: Icon, color }) => (
            <div key={label} className="card p-4 flex items-center gap-3">
              <div className={clsx('w-9 h-9 rounded-xl flex items-center justify-center', color)}>
                <Icon className="w-4 h-4" />
              </div>
              <div>
                <div className="font-bold text-ink">{String(value)}</div>
                <div className="text-xs text-ink-muted">{label}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Tabs + actions */}
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="flex bg-slate-100 rounded-xl p-1 gap-1">
            {(['vehicles', 'live', 'fuel'] as const).map(t => (
              <button key={t} onClick={() => setTab(t)}
                className={clsx('px-4 py-1.5 rounded-lg text-sm font-medium transition-all',
                  tab === t ? 'bg-white text-ink shadow-sm' : 'text-ink-muted hover:text-ink')}>
                {t === 'live' ? (
                  <span className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 bg-primary-500 rounded-full animate-pulse" />
                    Live GPS
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
                <button onClick={() => refetch()} className="btn-ghost"><RefreshCw className={clsx('w-4 h-4', isLoading && 'animate-spin')} /></button>
                <button onClick={() => setShowAdd(true)} className="btn-primary gap-2">
                  <Plus className="w-4 h-4" />Add Vehicle
                </button>
              </>
            )}
            {tab === 'fuel' && (
              <button onClick={() => setShowFuel(true)} className="btn-primary gap-2">
                <Plus className="w-4 h-4" />Log Fuel
              </button>
            )}
          </div>
        </div>

        {/* Vehicles table */}
        {tab === 'vehicles' && (
          <div className="card overflow-hidden">
            <table className="table">
              <thead>
                <tr>
                  <th>Vehicle</th>
                  <th>Driver</th>
                  <th>Status</th>
                  <th>Fuel Type</th>
                  <th>Last Seen</th>
                  <th>GPS</th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <tr><td colSpan={6} className="text-center py-12"><Loader2 className="w-6 h-6 animate-spin mx-auto text-ink-muted" /></td></tr>
                ) : vehicles.length === 0 ? (
                  <tr><td colSpan={6} className="text-center py-12 text-ink-muted">
                    <Truck className="w-10 h-10 mx-auto mb-2 opacity-30" />
                    No vehicles in fleet
                  </td></tr>
                ) : vehicles.map(v => {
                  const live = livePositions[v.id]
                  return (
                    <tr key={v.id}>
                      <td>
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 bg-slate-100 rounded-lg flex items-center justify-center">
                            <Truck className="w-4 h-4 text-ink-muted" />
                          </div>
                          <div>
                            <div className="font-mono font-bold text-ink">{v.plate}</div>
                            <div className="text-xs text-ink-muted">{v.make} {v.model} {v.year}</div>
                          </div>
                        </div>
                      </td>
                      <td className="text-ink-secondary text-sm">{v.driver_name || <span className="text-ink-muted italic">Unassigned</span>}</td>
                      <td><span className={STATUS_COLORS[v.status] ?? 'badge-gray'}>{v.status}</span></td>
                      <td className="text-ink-secondary text-sm capitalize">{v.fuel_type || '—'}</td>
                      <td className="text-ink-muted text-sm">{v.last_seen ? fmtDate(v.last_seen) : '—'}</td>
                      <td>
                        {live ? (
                          <span className="flex items-center gap-1 text-xs text-primary-600 font-medium">
                            <span className="w-1.5 h-1.5 bg-primary-500 rounded-full animate-pulse" />
                            Live · {live.speed} km/h
                          </span>
                        ) : (
                          <span className="text-xs text-ink-muted">Offline</span>
                        )}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Live GPS */}
        {tab === 'live' && (
          <div className="space-y-4">
            <div className="card p-5">
              <div className="flex items-center gap-2 mb-4">
                <span className="w-2 h-2 bg-primary-500 rounded-full animate-pulse" />
                <span className="text-sm font-medium text-ink">{liveCount} vehicles transmitting GPS</span>
              </div>
              {/* Map placeholder */}
              <div className="bg-slate-900 rounded-xl h-64 flex items-center justify-center relative overflow-hidden">
                <div className="absolute inset-0 opacity-10"
                  style={{ backgroundImage: 'radial-gradient(circle, #22C55E 1px, transparent 1px)', backgroundSize: '30px 30px' }} />
                <div className="text-center z-10">
                  <MapPin className="w-10 h-10 text-primary-500 mx-auto mb-2" />
                  <p className="text-white text-sm font-medium">Live GPS Map</p>
                  <p className="text-slate-400 text-xs mt-1">Connect Mapbox or Google Maps for live tracking</p>
                </div>
                {/* Live vehicle dots */}
                {Object.values(livePositions).map(pos => (
                  <div key={pos.vehicle_id}
                    className="absolute w-3 h-3 bg-primary-500 rounded-full border-2 border-white shadow-lg animate-pulse"
                    style={{ left: `${((pos.lng + 180) / 360) * 100}%`, top: `${((90 - pos.lat) / 180) * 100}%` }}
                    title={`${pos.plate} · ${pos.speed} km/h`}
                  />
                ))}
              </div>
            </div>

            {/* Live data table */}
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
                      No live GPS data
                    </td></tr>
                  ) : Object.values(livePositions).map(pos => (
                    <tr key={pos.vehicle_id}>
                      <td className="font-mono font-bold text-ink">{pos.plate}</td>
                      <td className="text-right">
                        <span className={clsx('font-semibold', pos.speed > 0 ? 'text-primary-600' : 'text-ink-muted')}>
                          {pos.speed} km/h
                        </span>
                      </td>
                      <td className="text-xs text-ink-muted font-mono">
                        {pos.lat.toFixed(4)}, {pos.lng.toFixed(4)}
                      </td>
                      <td className="text-ink-muted text-sm">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {new Date(pos.timestamp).toLocaleTimeString()}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Fuel records */}
        {tab === 'fuel' && (
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
                    No fuel records
                  </td></tr>
                ) : allFuelRecords.map(rec => (
                  <tr key={rec.id}>
                    <td className="font-mono font-medium text-ink">
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
        )}
      </div>

      {showAdd && <AddVehicleModal onClose={() => setShowAdd(false)} />}
      {showFuel && <LogFuelModal vehicles={vehicles} onClose={() => setShowFuel(false)} />}
    </div>
  )
}
