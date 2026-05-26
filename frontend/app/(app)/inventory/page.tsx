'use client'

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { inventoryApi } from '@/lib/api'
import PageHeroHeader, { HeroButton } from '@/components/dashboard/PageHeroHeader'
import {
  Package, Warehouse, AlertTriangle, Plus, Search,
  ArrowRightLeft, TrendingDown, Loader2, RefreshCw, X,
  Eye, Edit2, Trash2, MapPin, Hash, DollarSign, BarChart2,
} from 'lucide-react'
import toast from 'react-hot-toast'
import clsx from 'clsx'
import {
  BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
} from 'recharts'

const fmtRwf = (n: number) =>
  new Intl.NumberFormat('en-RW', { maximumFractionDigits: 0 }).format(n) + ' RWF'
const fmtRwfShort = (n: number) => {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + 'M'
  if (n >= 1_000) return (n / 1_000).toFixed(0) + 'K'
  return String(n)
}


function StockBadge({ qty, threshold }: { qty: number; threshold: number }) {
  if (qty === 0) return <span className="badge badge-red">Out of Stock</span>
  if (qty <= threshold) return <span className="badge badge-yellow">Low Stock</span>
  return <span className="badge badge-green">In Stock</span>
}

function ActionBtn({
  onClick, variant = 'view', label, icon: Icon, disabled,
}: {
  onClick: () => void
  variant?: 'view' | 'edit' | 'adjust' | 'delete'
  label: string
  icon: React.ElementType
  disabled?: boolean
}) {
  const styles = {
    view:   'text-slate-500 hover:text-blue-700 hover:bg-blue-50 border-slate-200 hover:border-blue-200',
    edit:   'text-slate-500 hover:text-orange-700 hover:bg-orange-50 border-slate-200 hover:border-orange-200',
    adjust: 'text-slate-500 hover:text-emerald-700 hover:bg-emerald-50 border-slate-200 hover:border-emerald-200',
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

interface StockItem {
  id: string
  name: string
  sku: string
  quantity: number
  reorder_point: number
  unit_cost: number
  warehouse_id: string
  warehouse_name?: string
  category?: string
}

interface WarehouseType {
  id: string
  name: string
  code?: string
  address?: Record<string, string>
  is_active?: boolean
  latitude?: number
  longitude?: number
}

/* ── View Item Modal ───────────────────────────────────────── */
function ViewItemModal({ item, onClose, onEdit }: { item: StockItem; onClose: () => void; onEdit: () => void }) {
  const stockValue = item.quantity * item.unit_cost
  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-sm shadow-2xl">
        <div className="flex items-center justify-between p-5 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-orange-50 rounded-xl flex items-center justify-center">
              <Package className="w-5 h-5 text-orange-500" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-base">{item.name}</h3>
              {item.category && <p className="text-xs text-slate-500 capitalize">{item.category}</p>}
            </div>
          </div>
          <button type="button" onClick={onClose} aria-label="Close" className="text-slate-400 hover:text-slate-600">
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="p-5 space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-slate-50 rounded-xl p-3">
              <p className="text-xs text-slate-500 mb-1 flex items-center gap-1"><Hash className="w-3 h-3" />SKU</p>
              <p className="font-mono font-semibold text-slate-800 text-sm">{item.sku || '—'}</p>
            </div>
            <div className="bg-slate-50 rounded-xl p-3">
              <p className="text-xs text-slate-500 mb-1 flex items-center gap-1"><MapPin className="w-3 h-3" />Warehouse</p>
              <p className="font-semibold text-slate-800 text-sm">{item.warehouse_name || '—'}</p>
            </div>
            <div className="bg-orange-50 rounded-xl p-3">
              <p className="text-xs text-slate-500 mb-1">Current Stock</p>
              <p className="font-bold text-2xl text-orange-600">{item.quantity}</p>
            </div>
            <div className="bg-slate-50 rounded-xl p-3">
              <p className="text-xs text-slate-500 mb-1">Reorder Point</p>
              <p className="font-bold text-xl text-slate-800">{item.reorder_point}</p>
            </div>
            <div className="bg-slate-50 rounded-xl p-3">
              <p className="text-xs text-slate-500 mb-1 flex items-center gap-1"><DollarSign className="w-3 h-3" />Unit Cost</p>
              <p className="font-semibold text-slate-800 text-sm">{fmtRwf(item.unit_cost)}</p>
            </div>
            <div className="bg-emerald-50 rounded-xl p-3">
              <p className="text-xs text-slate-500 mb-1 flex items-center gap-1"><BarChart2 className="w-3 h-3" />Total Value</p>
              <p className="font-bold text-emerald-700 text-sm">{fmtRwfShort(stockValue)} RWF</p>
            </div>
          </div>
          <div className="flex items-center justify-center pt-1">
            <StockBadge qty={item.quantity} threshold={item.reorder_point} />
          </div>
        </div>
        <div className="flex gap-2 p-5 border-t border-slate-100">
          <button type="button" onClick={onClose} className="flex-1 py-2 rounded-xl border border-slate-200 text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors">Close</button>
          <button type="button" onClick={onEdit} className="flex-1 py-2 rounded-xl bg-orange-500 hover:bg-orange-400 text-white text-sm font-semibold transition-colors">Edit Item</button>
        </div>
      </div>
    </div>
  )
}

/* ── Edit Item Modal ────────────────────────────────────────── */
function EditItemModal({ item, warehouses, onClose }: { item: StockItem; warehouses: WarehouseType[]; onClose: () => void }) {
  const qc = useQueryClient()
  const [form, setForm] = useState({
    name: item.name,
    sku: item.sku,
    category: item.category ?? '',
    reorder_point: item.reorder_point,
    unit_cost: item.unit_cost,
    warehouse_id: item.warehouse_id,
  })

  const mutation = useMutation({
    mutationFn: async () => { await inventoryApi.updateStockItem(item.id, form as Record<string, unknown>) },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['stock-items'] }); toast.success('Item updated'); onClose() },
    onError: () => toast.error('Update failed'),
  })

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl">
        <div className="flex items-center justify-between mb-5">
          <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
            <Edit2 className="w-4 h-4 text-orange-500" />Edit Item
          </h3>
          <button type="button" onClick={onClose} aria-label="Close" className="text-slate-400 hover:text-slate-600"><X className="w-5 h-5" /></button>
        </div>
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label htmlFor="edit-name" className="block text-xs font-medium text-slate-600 mb-1">Item Name</label>
              <input id="edit-name" className="input" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
            </div>
            <div>
              <label htmlFor="edit-sku" className="block text-xs font-medium text-slate-600 mb-1">SKU</label>
              <input id="edit-sku" className="input font-mono" value={form.sku} onChange={e => setForm(f => ({ ...f, sku: e.target.value }))} />
            </div>
          </div>
          <div>
            <label htmlFor="edit-category" className="block text-xs font-medium text-slate-600 mb-1">Category</label>
            <input id="edit-category" className="input" value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label htmlFor="edit-reorder" className="block text-xs font-medium text-slate-600 mb-1">Reorder Point</label>
              <input id="edit-reorder" className="input" type="number" min="0" value={form.reorder_point} onChange={e => setForm(f => ({ ...f, reorder_point: Number(e.target.value) }))} />
            </div>
            <div>
              <label htmlFor="edit-cost" className="block text-xs font-medium text-slate-600 mb-1">Unit Cost (RWF)</label>
              <input id="edit-cost" className="input" type="number" min="0" value={form.unit_cost} onChange={e => setForm(f => ({ ...f, unit_cost: Number(e.target.value) }))} />
            </div>
          </div>
          <div>
            <label htmlFor="edit-warehouse" className="block text-xs font-medium text-slate-600 mb-1">Warehouse</label>
            <select id="edit-warehouse" className="input" value={form.warehouse_id} onChange={e => setForm(f => ({ ...f, warehouse_id: e.target.value }))}>
              {warehouses.map(w => <option key={w.id} value={w.id}>{w.name}</option>)}
            </select>
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
          <p className="text-xs text-red-700">This action cannot be undone. All associated data will be permanently removed.</p>
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

/* ── View Warehouse Modal ───────────────────────────────────── */
function ViewWarehouseModal({ wh, items, lowStock, onClose, onEdit }: {
  wh: WarehouseType; items: StockItem[]; lowStock: StockItem[];
  onClose: () => void; onEdit: () => void
}) {
  const whItems = items.filter(i => i.warehouse_id === wh.id)
  const whLow = lowStock.filter(i => i.warehouse_id === wh.id)
  const totalValue = whItems.reduce((s, i) => s + i.quantity * i.unit_cost, 0)
  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl">
        <div className="flex items-center justify-between p-5 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center">
              <Warehouse className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-base">{wh.name}</h3>
              {wh.code && <p className="text-xs text-slate-400 font-mono">{wh.code}</p>}
              {wh.address?.city && <p className="text-xs text-slate-500 flex items-center gap-1"><MapPin className="w-3 h-3" />{wh.address.city}{wh.address.country ? `, ${wh.address.country}` : ''}</p>}
            </div>
          </div>
          <button type="button" onClick={onClose} aria-label="Close" className="text-slate-400 hover:text-slate-600"><X className="w-5 h-5" /></button>
        </div>
        <div className="p-5 space-y-4">
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-slate-50 rounded-xl p-3 text-center">
              <p className="text-2xl font-extrabold text-slate-900">{whItems.length}</p>
              <p className="text-xs text-slate-500 mt-0.5">Total Items</p>
            </div>
            <div className="bg-amber-50 rounded-xl p-3 text-center">
              <p className="text-2xl font-extrabold text-amber-600">{whLow.length}</p>
              <p className="text-xs text-slate-500 mt-0.5">Low Stock</p>
            </div>
            <div className="bg-emerald-50 rounded-xl p-3 text-center">
              <p className="text-lg font-extrabold text-emerald-700">{fmtRwfShort(totalValue)}</p>
              <p className="text-xs text-slate-500 mt-0.5">Total Value</p>
            </div>
          </div>
          {whItems.length > 0 && (
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Items in this warehouse</p>
              <div className="space-y-1.5 max-h-52 overflow-y-auto">
                {whItems.slice(0, 10).map(item => (
                  <div key={item.id} className="flex items-center justify-between py-2 px-3 bg-slate-50 rounded-xl">
                    <div>
                      <p className="text-sm font-medium text-slate-800">{item.name}</p>
                      <p className="text-xs text-slate-500 font-mono">{item.sku || '—'}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold text-slate-900">{item.quantity}</p>
                      <StockBadge qty={item.quantity} threshold={item.reorder_point} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
        <div className="flex gap-2 p-5 border-t border-slate-100">
          <button type="button" onClick={onClose} className="flex-1 py-2 rounded-xl border border-slate-200 text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors">Close</button>
          <button type="button" onClick={onEdit} className="flex-1 py-2 rounded-xl bg-orange-500 hover:bg-orange-400 text-white text-sm font-semibold transition-colors">Edit Warehouse</button>
        </div>
      </div>
    </div>
  )
}

/* ── Edit Warehouse Modal ───────────────────────────────────── */
function EditWarehouseModal({ wh, onClose }: { wh: WarehouseType; onClose: () => void }) {
  const qc = useQueryClient()
  const [form, setForm] = useState({
    name: wh.name,
    code: wh.code ?? '',
    city: wh.address?.city ?? '',
    country: wh.address?.country ?? '',
  })

  const mutation = useMutation({
    mutationFn: async () => {
      const payload: Record<string, unknown> = { name: form.name, code: form.code }
      if (form.city || form.country) {
        payload.address = { city: form.city, country: form.country }
      }
      await inventoryApi.updateWarehouse(wh.id, payload)
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['warehouses'] }); toast.success('Warehouse updated'); onClose() },
    onError: () => toast.error('Update failed'),
  })

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-2xl">
        <div className="flex items-center justify-between mb-5">
          <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
            <Edit2 className="w-4 h-4 text-orange-500" />Edit Warehouse
          </h3>
          <button type="button" onClick={onClose} aria-label="Close" className="text-slate-400 hover:text-slate-600"><X className="w-5 h-5" /></button>
        </div>
        <div className="space-y-3">
          <div>
            <label htmlFor="wh-name" className="block text-xs font-medium text-slate-600 mb-1">Warehouse Name</label>
            <input id="wh-name" className="input" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="Main Warehouse" />
          </div>
          <div>
            <label htmlFor="wh-code" className="block text-xs font-medium text-slate-600 mb-1">Code</label>
            <input id="wh-code" className="input font-mono" value={form.code} onChange={e => setForm(f => ({ ...f, code: e.target.value }))} placeholder="WH-KGL-01" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label htmlFor="wh-city" className="block text-xs font-medium text-slate-600 mb-1">City</label>
              <input id="wh-city" className="input" value={form.city} onChange={e => setForm(f => ({ ...f, city: e.target.value }))} placeholder="Kigali" />
            </div>
            <div>
              <label htmlFor="wh-country" className="block text-xs font-medium text-slate-600 mb-1">Country</label>
              <input id="wh-country" className="input" value={form.country} onChange={e => setForm(f => ({ ...f, country: e.target.value }))} placeholder="Rwanda" />
            </div>
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

/* ── Adjust Stock Modal ─────────────────────────────────────── */
function AdjustModal({ item, onClose }: { item: StockItem; onClose: () => void }) {
  const qc = useQueryClient()
  const [delta, setDelta] = useState(0)
  const [reason, setReason] = useState('')

  const mutation = useMutation({
    mutationFn: async () => { await inventoryApi.adjustStock(item.id, { quantity_delta: delta, reason }) },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['stock-items'] }); toast.success('Stock adjusted'); onClose() },
    onError: () => toast.error('Adjustment failed'),
  })

  const newQty = item.quantity + delta
  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-2xl">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-slate-900 flex items-center gap-2"><ArrowRightLeft className="w-4 h-4 text-emerald-500" />Adjust Stock</h3>
          <button type="button" onClick={onClose} aria-label="Close" className="text-slate-400 hover:text-slate-600"><X className="w-4 h-4" /></button>
        </div>
        <div className="bg-slate-50 rounded-xl p-3 mb-4 flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold text-slate-800">{item.name}</p>
            <p className="text-xs text-slate-500 font-mono">{item.sku}</p>
          </div>
          <div className="text-right">
            <p className="text-xs text-slate-500">Current</p>
            <p className="text-xl font-extrabold text-slate-900">{item.quantity}</p>
          </div>
        </div>
        <div className="space-y-3">
          <div>
            <label htmlFor="adj-delta" className="block text-xs font-medium text-slate-600 mb-1">Quantity Change (+ add / − remove)</label>
            <input id="adj-delta" className="input text-center text-lg font-bold" type="number" placeholder="+10 or -5" value={delta} onChange={e => setDelta(Number(e.target.value))} />
          </div>
          {delta !== 0 && (
            <div className={clsx('rounded-xl p-2.5 text-center text-sm font-semibold', newQty >= 0 ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-600')}>
              New quantity will be: <strong>{Math.max(0, newQty)}</strong>
            </div>
          )}
          <div>
            <label htmlFor="adj-reason" className="block text-xs font-medium text-slate-600 mb-1">Reason for adjustment</label>
            <input id="adj-reason" className="input" value={reason} onChange={e => setReason(e.target.value)} placeholder="Received shipment, damaged goods…" required />
          </div>
        </div>
        <div className="flex gap-2 mt-5">
          <button type="button" onClick={onClose} className="flex-1 py-2 rounded-xl border border-slate-200 text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors">Cancel</button>
          <button type="button" onClick={() => mutation.mutate()} disabled={!reason || delta === 0 || mutation.isPending}
            className="flex-1 flex items-center justify-center gap-2 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-white text-sm font-semibold transition-colors disabled:opacity-50">
            {mutation.isPending && <Loader2 className="w-4 h-4 animate-spin" />}Apply Adjustment
          </button>
        </div>
      </div>
    </div>
  )
}

/* ── Add Warehouse Modal ────────────────────────────────────── */
function AddWarehouseModal({ onClose }: { onClose: () => void }) {
  const qc = useQueryClient()
  const [form, setForm] = useState({ name: '', code: '', city: '', country: 'Rwanda' })

  const mutation = useMutation({
    mutationFn: async () => {
      const payload: Record<string, unknown> = { name: form.name, code: form.code }
      if (form.city || form.country) {
        payload.address = { city: form.city, country: form.country }
      }
      await inventoryApi.createWarehouse(payload)
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['warehouses'] }); toast.success('Warehouse created'); onClose() },
    onError: () => toast.error('Failed to create warehouse'),
  })

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-2xl">
        <div className="flex items-center justify-between mb-5">
          <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
            <Plus className="w-4 h-4 text-blue-500" />Add Warehouse
          </h3>
          <button type="button" onClick={onClose} aria-label="Close" className="text-slate-400 hover:text-slate-600"><X className="w-5 h-5" /></button>
        </div>
        <div className="space-y-3">
          <div>
            <label htmlFor="aw-name" className="block text-xs font-medium text-slate-600 mb-1">Warehouse Name</label>
            <input id="aw-name" className="input" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="Main Warehouse" required />
          </div>
          <div>
            <label htmlFor="aw-code" className="block text-xs font-medium text-slate-600 mb-1">Code <span className="text-red-400">*</span></label>
            <input id="aw-code" className="input font-mono" value={form.code} onChange={e => setForm(f => ({ ...f, code: e.target.value }))} placeholder="WH-KGL-01" required />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label htmlFor="aw-city" className="block text-xs font-medium text-slate-600 mb-1">City</label>
              <input id="aw-city" className="input" value={form.city} onChange={e => setForm(f => ({ ...f, city: e.target.value }))} placeholder="Kigali" />
            </div>
            <div>
              <label htmlFor="aw-country" className="block text-xs font-medium text-slate-600 mb-1">Country</label>
              <input id="aw-country" className="input" value={form.country} onChange={e => setForm(f => ({ ...f, country: e.target.value }))} placeholder="Rwanda" />
            </div>
          </div>
        </div>
        <div className="flex gap-2 mt-5">
          <button type="button" onClick={onClose} className="flex-1 py-2 rounded-xl border border-slate-200 text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors">Cancel</button>
          <button type="button" onClick={() => mutation.mutate()} disabled={!form.name || !form.code || mutation.isPending}
            className="flex-1 flex items-center justify-center gap-2 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold transition-colors disabled:opacity-50">
            {mutation.isPending && <Loader2 className="w-4 h-4 animate-spin" />}Create Warehouse
          </button>
        </div>
      </div>
    </div>
  )
}

/* ── Add Item Modal ─────────────────────────────────────────── */
function AddItemModal({ warehouses, onClose }: { warehouses: WarehouseType[]; onClose: () => void }) {
  const qc = useQueryClient()
  const [form, setForm] = useState({
    name: '', sku: '', category: '', quantity: 0, reorder_point: 10, unit_cost: 0,
    warehouse_id: warehouses[0]?.id ?? '',
  })

  const mutation = useMutation({
    mutationFn: async () => { await inventoryApi.createStockItem(form as Record<string, unknown>) },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['stock-items'] }); toast.success('Item created'); onClose() },
    onError: () => toast.error('Failed to create item'),
  })

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl">
        <div className="flex items-center justify-between mb-5">
          <h3 className="font-bold text-slate-900 text-base flex items-center gap-2"><Plus className="w-4 h-4 text-orange-500" />Add Stock Item</h3>
          <button type="button" onClick={onClose} aria-label="Close" className="text-slate-400 hover:text-slate-600"><X className="w-4 h-4" /></button>
        </div>
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label htmlFor="item-name" className="block text-xs font-medium text-slate-600 mb-1">Item Name</label>
              <input id="item-name" className="input" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="Product name" required />
            </div>
            <div>
              <label htmlFor="item-sku" className="block text-xs font-medium text-slate-600 mb-1">SKU</label>
              <input id="item-sku" className="input" value={form.sku} onChange={e => setForm(f => ({ ...f, sku: e.target.value }))} placeholder="SKU-001" />
            </div>
          </div>
          <div>
            <label htmlFor="item-category" className="block text-xs font-medium text-slate-600 mb-1">Category</label>
            <input id="item-category" className="input" value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))} placeholder="Electronics, Furniture…" />
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label htmlFor="item-qty" className="block text-xs font-medium text-slate-600 mb-1">Quantity</label>
              <input id="item-qty" className="input" type="number" min="0" placeholder="0" value={form.quantity} onChange={e => setForm(f => ({ ...f, quantity: Number(e.target.value) }))} />
            </div>
            <div>
              <label htmlFor="item-reorder" className="block text-xs font-medium text-slate-600 mb-1">Reorder Pt.</label>
              <input id="item-reorder" className="input" type="number" min="0" placeholder="10" value={form.reorder_point} onChange={e => setForm(f => ({ ...f, reorder_point: Number(e.target.value) }))} />
            </div>
            <div>
              <label htmlFor="item-cost" className="block text-xs font-medium text-slate-600 mb-1">Unit Cost</label>
              <input id="item-cost" className="input" type="number" min="0" placeholder="0" value={form.unit_cost} onChange={e => setForm(f => ({ ...f, unit_cost: Number(e.target.value) }))} />
            </div>
          </div>
          <div>
            <label htmlFor="item-warehouse" className="block text-xs font-medium text-slate-600 mb-1">Warehouse</label>
            <select id="item-warehouse" className="input" value={form.warehouse_id} onChange={e => setForm(f => ({ ...f, warehouse_id: e.target.value }))}>
              {warehouses.map(w => <option key={w.id} value={w.id}>{w.name}</option>)}
            </select>
          </div>
        </div>
        <div className="flex gap-2 mt-5">
          <button type="button" onClick={onClose} className="flex-1 py-2 rounded-xl border border-slate-200 text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors">Cancel</button>
          <button type="button" onClick={() => mutation.mutate()} disabled={!form.name || mutation.isPending}
            className="flex-1 flex items-center justify-center gap-2 py-2 rounded-xl bg-orange-500 hover:bg-orange-400 text-white text-sm font-semibold transition-colors disabled:opacity-50">
            {mutation.isPending && <Loader2 className="w-4 h-4 animate-spin" />}Add Item
          </button>
        </div>
      </div>
    </div>
  )
}

/* ── Main Page ──────────────────────────────────────────────── */
export default function InventoryPage() {
  const [tab, setTab] = useState<'items' | 'warehouses' | 'low-stock'>('items')
  const [search, setSearch] = useState('')
  const [adjustItem, setAdjustItem]     = useState<StockItem | null>(null)
  const [viewItem, setViewItem]         = useState<StockItem | null>(null)
  const [editItem, setEditItem]         = useState<StockItem | null>(null)
  const [deleteItem, setDeleteItem]     = useState<StockItem | null>(null)
  const [viewWarehouse, setViewWarehouse]   = useState<WarehouseType | null>(null)
  const [editWarehouse, setEditWarehouse]   = useState<WarehouseType | null>(null)
  const [deleteWarehouse, setDeleteWarehouse] = useState<WarehouseType | null>(null)
  const [showAdd, setShowAdd] = useState(false)
  const [showAddWarehouse, setShowAddWarehouse] = useState(false)

  const qc = useQueryClient()

  const { data: warehouses = [] } = useQuery({
    queryKey: ['warehouses'],
    queryFn: () => inventoryApi.warehouses().then(r => r.data?.data ?? r.data ?? []),
  })

  const { data: stockData, isLoading, refetch } = useQuery({
    queryKey: ['stock-items', search],
    queryFn: () => inventoryApi.stockItems(search ? { search } : undefined).then(r => r.data?.data ?? r.data ?? []),
  })

  const { data: lowStockData = [] } = useQuery({
    queryKey: ['low-stock'],
    queryFn: () => inventoryApi.lowStock().then(r => r.data?.data ?? r.data ?? []),
  })

  const { data: valueData } = useQuery({
    queryKey: ['inventory-value'],
    queryFn: () => inventoryApi.inventoryValue().then(r => r.data?.data ?? r.data),
  })

  const deleteItemMutation = useMutation({
    mutationFn: async (id: string) => { await inventoryApi.deleteStockItem(id) },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['stock-items'] }); toast.success('Item deleted'); setDeleteItem(null) },
    onError: () => toast.error('Delete failed'),
  })

  const deleteWarehouseMutation = useMutation({
    mutationFn: async (id: string) => { await inventoryApi.deleteWarehouse(id) },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['warehouses'] }); toast.success('Warehouse deleted'); setDeleteWarehouse(null) },
    onError: () => toast.error('Delete failed'),
  })

  const items: StockItem[] = stockData ?? []
  const lowStock: StockItem[] = lowStockData ?? []

  const inStockCount = items.filter(i => i.quantity > i.reorder_point).length
  const lowStockCount = items.filter(i => i.quantity > 0 && i.quantity <= i.reorder_point).length
  const outCount = items.filter(i => i.quantity === 0).length

  const stockStatusData = [
    { name: 'In Stock',    value: inStockCount,  fill: '#10b981', dotClass: 'bg-emerald-500' },
    { name: 'Low Stock',   value: lowStockCount, fill: '#f59e0b', dotClass: 'bg-amber-500' },
    { name: 'Out of Stock',value: outCount,       fill: '#ef4444', dotClass: 'bg-red-500' },
  ].filter(d => d.value > 0)

  const categoryData = Object.entries(
    items.reduce<Record<string, { count: number; value: number }>>((acc, item) => {
      const cat = item.category || 'Uncategorised'
      if (!acc[cat]) acc[cat] = { count: 0, value: 0 }
      acc[cat].count += 1
      acc[cat].value += item.quantity * item.unit_cost
      return acc
    }, {})
  )
    .map(([cat, v]) => ({ cat: cat.length > 12 ? cat.slice(0, 11) + '…' : cat, ...v }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 7)

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <PageHeroHeader
        title="Inventory"
        highlight="Inventory"
        subtitle="Warehouses, stock levels & reorder management"
        imageIndex={1}
        stats={[
          { label: 'items', value: items.length },
          { label: 'low stock', value: lowStock.length, positive: lowStock.length === 0 },
        ]}
        actions={
          <HeroButton variant="orange" onClick={() => setShowAdd(true)}>
            <Plus className="w-3.5 h-3.5" />Add Item
          </HeroButton>
        }
      />

      <div className="flex-1 overflow-y-auto p-6 space-y-5">

        {/* ── KPI strip ─────────────────────────── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {[
            { label: 'Total Items',  value: items.length,                                               icon: Package,      color: 'bg-orange-50 text-orange-600' },
            { label: 'Warehouses',   value: (warehouses as WarehouseType[]).length,                     icon: Warehouse,    color: 'bg-blue-50 text-blue-600' },
            { label: 'Low Stock',    value: lowStock.length,                                            icon: AlertTriangle,color: 'bg-amber-50 text-amber-600' },
            { label: 'Total Value',  value: valueData?.total_value ? fmtRwfShort(valueData.total_value) + ' RWF' : '—', icon: TrendingDown, color: 'bg-purple-50 text-purple-600' },
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

        {/* ── Charts ────────────────────────────── */}
        {items.length > 0 && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="card p-5">
              <div className="mb-4">
                <h3 className="text-sm font-bold text-ink">Stock Status Distribution</h3>
                <p className="text-xs text-ink-muted">In stock · Low stock · Out of stock</p>
              </div>
              <div className="flex items-center gap-4">
                <ResponsiveContainer width="50%" height={140}>
                  <PieChart>
                    <Pie data={stockStatusData} cx="50%" cy="50%" innerRadius={35} outerRadius={60} dataKey="value" paddingAngle={3}>
                      {stockStatusData.map((entry, i) => <Cell key={i} fill={entry.fill} />)}
                    </Pie>
                    <Tooltip formatter={(v: number, n: string) => [`${v} items`, n]} contentStyle={{ borderRadius: 10, border: '1px solid #e2e8f0', fontSize: 12 }} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="space-y-2">
                  {stockStatusData.map((d, i) => (
                    <div key={d.name} className="flex items-center gap-2 text-sm">
                      <span className={clsx('w-2.5 h-2.5 rounded-full shrink-0', d.dotClass)} />
                      <span className="text-ink-secondary">{d.name}</span>
                      <span className="font-bold text-ink ml-auto">{d.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <div className="card p-5">
              <div className="mb-4">
                <h3 className="text-sm font-bold text-ink">Stock Value by Category</h3>
                <p className="text-xs text-ink-muted">Total value (qty × unit cost) per category</p>
              </div>
              {categoryData.length === 0 ? (
                <div className="h-[140px] flex items-center justify-center text-sm text-ink-muted">No categories</div>
              ) : (
                <ResponsiveContainer width="100%" height={140}>
                  <BarChart data={categoryData} layout="vertical" margin={{ top: 0, right: 8, bottom: 0, left: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" horizontal={false} />
                    <XAxis type="number" tickFormatter={n => fmtRwfShort(n)} tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                    <YAxis type="category" dataKey="cat" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} width={72} />
                    <Tooltip formatter={(v: number) => [fmtRwf(v), 'Value']} contentStyle={{ borderRadius: 10, border: '1px solid #e2e8f0', fontSize: 12 }} />
                    <Bar dataKey="value" fill="#f97316" radius={[0, 6, 6, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>
        )}

        {/* ── Tabs + actions ────────────────────── */}
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="flex bg-slate-100 rounded-xl p-1 gap-1">
            {(['items', 'warehouses', 'low-stock'] as const).map(t => (
              <button key={t} type="button" onClick={() => setTab(t)}
                className={clsx('px-4 py-1.5 rounded-lg text-sm font-medium transition-all capitalize',
                  tab === t ? 'bg-white text-ink shadow-sm' : 'text-ink-muted hover:text-ink')}>
                {t === 'low-stock' ? (
                  <span className="flex items-center gap-1.5">
                    Low Stock
                    {lowStock.length > 0 && (
                      <span className="bg-red-500 text-white text-[10px] rounded-full px-1.5 py-0.5 leading-none">{lowStock.length}</span>
                    )}
                  </span>
                ) : t.charAt(0).toUpperCase() + t.slice(1)}
              </button>
            ))}
          </div>
          {tab === 'items' && (
            <div className="flex gap-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-muted" />
                <input className="input pl-9 w-48" placeholder="Search items…" value={search} onChange={e => setSearch(e.target.value)} />
              </div>
              <button type="button" onClick={() => refetch()} aria-label="Refresh items" className="btn-ghost">
                <RefreshCw className={clsx('w-4 h-4', isLoading && 'animate-spin')} />
              </button>
              <button type="button" onClick={() => setShowAdd(true)} className="btn-primary gap-2">
                <Plus className="w-4 h-4" />Add Item
              </button>
            </div>
          )}
          {tab === 'warehouses' && (
            <button type="button" onClick={() => setShowAddWarehouse(true)} className="btn-primary gap-2">
              <Plus className="w-4 h-4" />Add Warehouse
            </button>
          )}
        </div>

        {/* ── Items table ───────────────────────── */}
        {tab === 'items' && (
          <div className="card overflow-hidden">
            <table className="table">
              <thead>
                <tr>
                  <th>Item</th>
                  <th>SKU</th>
                  <th>Warehouse</th>
                  <th className="text-right">Qty</th>
                  <th className="text-right">Unit Cost</th>
                  <th>Status</th>
                  <th className="text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <tr><td colSpan={7} className="text-center py-12"><Loader2 className="w-6 h-6 animate-spin mx-auto text-ink-muted" /></td></tr>
                ) : items.length === 0 ? (
                  <tr><td colSpan={7} className="text-center py-12 text-ink-muted">
                    <Package className="w-10 h-10 mx-auto mb-2 opacity-30" />
                    <p className="text-sm">No stock items yet</p>
                  </td></tr>
                ) : items.map(item => (
                  <tr key={item.id}>
                    <td>
                      <div className="font-semibold text-ink">{item.name}</div>
                      {item.category && <div className="text-xs text-ink-muted capitalize">{item.category}</div>}
                    </td>
                    <td className="font-mono text-sm text-ink-secondary">{item.sku || '—'}</td>
                    <td className="text-ink-secondary text-sm">{item.warehouse_name || '—'}</td>
                    <td className="text-right font-bold text-ink">{item.quantity}</td>
                    <td className="text-right text-ink-secondary text-sm">{fmtRwf(item.unit_cost)}</td>
                    <td><StockBadge qty={item.quantity} threshold={item.reorder_point} /></td>
                    <td>
                      <div className="flex items-center justify-end gap-1.5">
                        <ActionBtn variant="view"   label="View"   icon={Eye}            onClick={() => setViewItem(item)} />
                        <ActionBtn variant="edit"   label="Edit"   icon={Edit2}           onClick={() => setEditItem(item)} />
                        <ActionBtn variant="adjust" label="Adjust" icon={ArrowRightLeft}  onClick={() => setAdjustItem(item)} />
                        <ActionBtn variant="delete" label="Delete" icon={Trash2}          onClick={() => setDeleteItem(item)} />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* ── Warehouses grid ───────────────────── */}
        {tab === 'warehouses' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {(warehouses as WarehouseType[]).map(wh => (
              <div key={wh.id} className="card p-5 hover:border-slate-200 transition-colors">
                <div className="flex items-start gap-3 mb-4">
                  <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center shrink-0">
                    <Warehouse className="w-5 h-5 text-blue-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-ink">{wh.name}</div>
                    {wh.code && <div className="text-xs text-ink-muted font-mono">{wh.code}</div>}
                    {wh.address?.city && (
                      <div className="text-xs text-ink-muted flex items-center gap-1 mt-0.5">
                        <MapPin className="w-3 h-3" />{wh.address.city}
                      </div>
                    )}
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2 mb-4">
                  <div className="bg-slate-50 rounded-xl p-3 text-center">
                    <div className="font-bold text-lg text-ink">{items.filter(i => i.warehouse_id === wh.id).length}</div>
                    <div className="text-xs text-ink-muted">Total Items</div>
                  </div>
                  <div className="bg-amber-50 rounded-xl p-3 text-center">
                    <div className="font-bold text-lg text-amber-600">{lowStock.filter(i => i.warehouse_id === wh.id).length}</div>
                    <div className="text-xs text-ink-muted">Low Stock</div>
                  </div>
                </div>
                <div className="flex gap-1.5 pt-3 border-t border-slate-100">
                  <ActionBtn variant="view"   label="View"   icon={Eye}    onClick={() => setViewWarehouse(wh)} />
                  <ActionBtn variant="edit"   label="Edit"   icon={Edit2}  onClick={() => setEditWarehouse(wh)} />
                  <ActionBtn variant="delete" label="Delete" icon={Trash2} onClick={() => setDeleteWarehouse(wh)} />
                </div>
              </div>
            ))}
            {(warehouses as WarehouseType[]).length === 0 && (
              <div className="col-span-3 text-center py-12 text-ink-muted">
                <Warehouse className="w-10 h-10 mx-auto mb-2 opacity-30" />
                <p className="text-sm">No warehouses configured</p>
              </div>
            )}
          </div>
        )}

        {/* ── Low stock table ───────────────────── */}
        {tab === 'low-stock' && (
          <div className="card overflow-hidden">
            <div className="flex items-center gap-2 p-4 border-b border-slate-100 bg-amber-50">
              <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
              <span className="text-sm font-semibold text-amber-700">{lowStock.length} items need restocking</span>
            </div>
            <table className="table">
              <thead>
                <tr>
                  <th>Item</th>
                  <th>Warehouse</th>
                  <th className="text-right">Current Qty</th>
                  <th className="text-right">Reorder Point</th>
                  <th>Status</th>
                  <th className="text-right">Action</th>
                </tr>
              </thead>
              <tbody>
                {lowStock.map(item => (
                  <tr key={item.id}>
                    <td>
                      <div className="font-semibold text-ink">{item.name}</div>
                      <div className="text-xs text-ink-muted font-mono">{item.sku}</div>
                    </td>
                    <td className="text-ink-secondary text-sm">{item.warehouse_name || '—'}</td>
                    <td className="text-right font-bold text-red-500">{item.quantity}</td>
                    <td className="text-right text-ink-secondary">{item.reorder_point}</td>
                    <td><StockBadge qty={item.quantity} threshold={item.reorder_point} /></td>
                    <td>
                      <div className="flex justify-end">
                        <button type="button" onClick={() => setAdjustItem(item)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-orange-500 hover:bg-orange-400 text-white text-xs font-semibold transition-all shadow-sm">
                          <Plus className="w-3.5 h-3.5" />Restock
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {lowStock.length === 0 && (
                  <tr><td colSpan={6} className="text-center py-12 text-ink-muted">
                    <span className="text-2xl">✓</span>
                    <p className="text-sm mt-2 font-medium">All items are well stocked</p>
                  </td></tr>
                )}
              </tbody>
            </table>
          </div>
        )}

      </div>

      {/* ── Modals ──────────────────────────────────────────────── */}
      {viewItem && (
        <ViewItemModal
          item={viewItem}
          onClose={() => setViewItem(null)}
          onEdit={() => { setEditItem(viewItem); setViewItem(null) }}
        />
      )}
      {editItem && (
        <EditItemModal
          item={editItem}
          warehouses={warehouses as WarehouseType[]}
          onClose={() => setEditItem(null)}
        />
      )}
      {adjustItem && <AdjustModal item={adjustItem} onClose={() => setAdjustItem(null)} />}
      {deleteItem && (
        <DeleteConfirmModal
          title={`Delete "${deleteItem.name}"?`}
          description="This will permanently remove the item and all its history."
          isPending={deleteItemMutation.isPending}
          onConfirm={() => deleteItemMutation.mutate(deleteItem.id)}
          onClose={() => setDeleteItem(null)}
        />
      )}
      {viewWarehouse && (
        <ViewWarehouseModal
          wh={viewWarehouse}
          items={items}
          lowStock={lowStock}
          onClose={() => setViewWarehouse(null)}
          onEdit={() => { setEditWarehouse(viewWarehouse); setViewWarehouse(null) }}
        />
      )}
      {editWarehouse && <EditWarehouseModal wh={editWarehouse} onClose={() => setEditWarehouse(null)} />}
      {deleteWarehouse && (
        <DeleteConfirmModal
          title={`Delete "${deleteWarehouse.name}"?`}
          description="This will permanently remove the warehouse. Items inside must be moved first."
          isPending={deleteWarehouseMutation.isPending}
          onConfirm={() => deleteWarehouseMutation.mutate(deleteWarehouse.id)}
          onClose={() => setDeleteWarehouse(null)}
        />
      )}
      {showAdd && <AddItemModal warehouses={warehouses as WarehouseType[]} onClose={() => setShowAdd(false)} />}
      {showAddWarehouse && <AddWarehouseModal onClose={() => setShowAddWarehouse(false)} />}
    </div>
  )
}
