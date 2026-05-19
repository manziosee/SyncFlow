'use client'

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { inventoryApi } from '@/lib/api'
import PageHeroHeader, { HeroButton } from '@/components/dashboard/PageHeroHeader'
import {
  Package, Warehouse, AlertTriangle, Plus, Search,
  ArrowRightLeft, TrendingDown, Loader2, RefreshCw, X
} from 'lucide-react'
import toast from 'react-hot-toast'
import clsx from 'clsx'

const fmtRwf = (n: number) =>
  new Intl.NumberFormat('en-RW', { maximumFractionDigits: 0 }).format(n) + ' RWF'

function StockBadge({ qty, threshold }: { qty: number; threshold: number }) {
  if (qty === 0) return <span className="badge-red">Out of Stock</span>
  if (qty <= threshold) return <span className="badge-yellow">Low Stock</span>
  return <span className="badge-green">In Stock</span>
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

interface Warehouse {
  id: string
  name: string
  location?: string
  capacity?: number
}

function AdjustModal({ item, onClose }: { item: StockItem; onClose: () => void }) {
  const qc = useQueryClient()
  const [delta, setDelta] = useState(0)
  const [reason, setReason] = useState('')

  const mutation = useMutation({
    mutationFn: () => inventoryApi.adjustStock(item.id, { quantity_delta: delta, reason }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['stock-items'] }); toast.success('Stock adjusted'); onClose() },
    onError: () => toast.error('Adjustment failed'),
  })

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-2xl">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-ink">Adjust Stock</h3>
          <button onClick={onClose} className="text-ink-muted hover:text-ink"><X className="w-4 h-4" /></button>
        </div>
        <p className="text-sm text-ink-secondary mb-4">{item.name} · Current qty: <strong>{item.quantity}</strong></p>
        <div className="space-y-3">
          <div>
            <label className="block text-xs font-medium text-ink-secondary mb-1">Quantity Delta (+ or −)</label>
            <input className="input" type="number" value={delta} onChange={e => setDelta(Number(e.target.value))}
              placeholder="+10 or -5" />
          </div>
          <div>
            <label className="block text-xs font-medium text-ink-secondary mb-1">Reason</label>
            <input className="input" value={reason} onChange={e => setReason(e.target.value)}
              placeholder="Received shipment / damaged…" required />
          </div>
        </div>
        <div className="flex gap-2 mt-4">
          <button onClick={onClose} className="btn-ghost flex-1">Cancel</button>
          <button
            onClick={() => mutation.mutate()}
            disabled={!reason || delta === 0 || mutation.isPending}
            className="btn-primary flex-1 gap-2"
          >
            {mutation.isPending && <Loader2 className="w-4 h-4 animate-spin" />}
            Apply
          </button>
        </div>
      </div>
    </div>
  )
}

function AddItemModal({ warehouses, onClose }: { warehouses: Warehouse[]; onClose: () => void }) {
  const qc = useQueryClient()
  const [form, setForm] = useState({
    name: '', sku: '', category: '', quantity: 0, reorder_point: 10, unit_cost: 0, warehouse_id: warehouses[0]?.id ?? ''
  })

  const mutation = useMutation({
    mutationFn: () => inventoryApi.createStockItem(form as Record<string, unknown>),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['stock-items'] }); toast.success('Item created'); onClose() },
    onError: () => toast.error('Failed to create item'),
  })

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-ink">Add Stock Item</h3>
          <button onClick={onClose} className="text-ink-muted hover:text-ink"><X className="w-4 h-4" /></button>
        </div>
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-ink-secondary mb-1">Name</label>
              <input className="input" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="Product name" required />
            </div>
            <div>
              <label className="block text-xs font-medium text-ink-secondary mb-1">SKU</label>
              <input className="input" value={form.sku} onChange={e => setForm(f => ({ ...f, sku: e.target.value }))} placeholder="SKU-001" />
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-ink-secondary mb-1">Category</label>
            <input className="input" value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))} placeholder="Electronics, Furniture…" />
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-medium text-ink-secondary mb-1">Qty</label>
              <input className="input" type="number" min="0" value={form.quantity} onChange={e => setForm(f => ({ ...f, quantity: Number(e.target.value) }))} />
            </div>
            <div>
              <label className="block text-xs font-medium text-ink-secondary mb-1">Reorder Pt</label>
              <input className="input" type="number" min="0" value={form.reorder_point} onChange={e => setForm(f => ({ ...f, reorder_point: Number(e.target.value) }))} />
            </div>
            <div>
              <label className="block text-xs font-medium text-ink-secondary mb-1">Unit Cost</label>
              <input className="input" type="number" min="0" value={form.unit_cost} onChange={e => setForm(f => ({ ...f, unit_cost: Number(e.target.value) }))} />
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-ink-secondary mb-1">Warehouse</label>
            <select className="input" value={form.warehouse_id} onChange={e => setForm(f => ({ ...f, warehouse_id: e.target.value }))}>
              {warehouses.map(w => <option key={w.id} value={w.id}>{w.name}</option>)}
            </select>
          </div>
        </div>
        <div className="flex gap-2 mt-4">
          <button onClick={onClose} className="btn-ghost flex-1">Cancel</button>
          <button onClick={() => mutation.mutate()} disabled={!form.name || mutation.isPending} className="btn-primary flex-1 gap-2">
            {mutation.isPending && <Loader2 className="w-4 h-4 animate-spin" />}
            Add Item
          </button>
        </div>
      </div>
    </div>
  )
}

export default function InventoryPage() {
  const qc = useQueryClient()
  const [tab, setTab] = useState<'items' | 'warehouses' | 'low-stock'>('items')
  const [search, setSearch] = useState('')
  const [adjustItem, setAdjustItem] = useState<StockItem | null>(null)
  const [showAdd, setShowAdd] = useState(false)

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
    queryFn: () => inventoryApi.inventoryValue().then(r => r.data),
  })

  const items: StockItem[] = stockData ?? []
  const lowStock: StockItem[] = lowStockData ?? []

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
            <Plus className="w-3.5 h-3.5" />
            Add Item
          </HeroButton>
        }
      />
      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        {/* KPI strip */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {[
            { label: 'Total Items', value: items.length, icon: Package, color: 'bg-primary-100 text-primary-600' },
            { label: 'Warehouses', value: (warehouses as Warehouse[]).length, icon: Warehouse, color: 'bg-blue-100 text-blue-600' },
            { label: 'Low Stock', value: lowStock.length, icon: AlertTriangle, color: 'bg-warning-bg text-warning' },
            { label: 'Total Value', value: valueData?.total_value ? fmtRwf(valueData.total_value) : '—', icon: TrendingDown, color: 'bg-purple-100 text-purple-600' },
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

        {/* Tabs */}
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="flex bg-slate-100 rounded-xl p-1 gap-1">
            {(['items', 'warehouses', 'low-stock'] as const).map(t => (
              <button key={t} onClick={() => setTab(t)}
                className={clsx('px-4 py-1.5 rounded-lg text-sm font-medium transition-all capitalize',
                  tab === t ? 'bg-white text-ink shadow-sm' : 'text-ink-muted hover:text-ink')}>
                {t === 'low-stock' ? 'Low Stock' : t.charAt(0).toUpperCase() + t.slice(1)}
                {t === 'low-stock' && lowStock.length > 0 && (
                  <span className="ml-1.5 bg-danger text-white text-[10px] rounded-full px-1.5 py-0.5">{lowStock.length}</span>
                )}
              </button>
            ))}
          </div>
          <div className="flex gap-2">
            {tab === 'items' && (
              <>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-muted" />
                  <input className="input pl-9 w-48" placeholder="Search items…" value={search} onChange={e => setSearch(e.target.value)} />
                </div>
                <button onClick={() => refetch()} className="btn-ghost">
                  <RefreshCw className={clsx('w-4 h-4', isLoading && 'animate-spin')} />
                </button>
                <button onClick={() => setShowAdd(true)} className="btn-primary gap-2">
                  <Plus className="w-4 h-4" />
                  Add Item
                </button>
              </>
            )}
          </div>
        </div>

        {/* Content */}
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
                    No stock items
                  </td></tr>
                ) : items.map(item => (
                  <tr key={item.id}>
                    <td>
                      <div className="font-medium text-ink">{item.name}</div>
                      {item.category && <div className="text-xs text-ink-muted capitalize">{item.category}</div>}
                    </td>
                    <td className="font-mono text-sm text-ink-secondary">{item.sku || '—'}</td>
                    <td className="text-ink-secondary text-sm">{item.warehouse_name || '—'}</td>
                    <td className="text-right font-semibold text-ink">{item.quantity}</td>
                    <td className="text-right text-ink-secondary text-sm">{fmtRwf(item.unit_cost)}</td>
                    <td><StockBadge qty={item.quantity} threshold={item.reorder_point} /></td>
                    <td>
                      <div className="flex justify-end gap-1">
                        <button onClick={() => setAdjustItem(item)} className="btn-ghost p-1.5 text-xs" title="Adjust">
                          <ArrowRightLeft className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {tab === 'warehouses' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {(warehouses as Warehouse[]).map(wh => (
              <div key={wh.id} className="card p-5">
                <div className="flex items-start gap-3 mb-4">
                  <div className="w-10 h-10 bg-primary-100 rounded-xl flex items-center justify-center">
                    <Warehouse className="w-5 h-5 text-primary-600" />
                  </div>
                  <div>
                    <div className="font-semibold text-ink">{wh.name}</div>
                    {wh.location && <div className="text-xs text-ink-muted">{wh.location}</div>}
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div className="bg-slate-50 rounded-lg p-2 text-center">
                    <div className="font-bold text-ink">{items.filter(i => i.warehouse_id === wh.id).length}</div>
                    <div className="text-xs text-ink-muted">Items</div>
                  </div>
                  <div className="bg-slate-50 rounded-lg p-2 text-center">
                    <div className="font-bold text-warning">{lowStock.filter(i => i.warehouse_id === wh.id).length}</div>
                    <div className="text-xs text-ink-muted">Low stock</div>
                  </div>
                </div>
              </div>
            ))}
            {(warehouses as Warehouse[]).length === 0 && (
              <div className="col-span-3 text-center py-12 text-ink-muted">
                <Warehouse className="w-10 h-10 mx-auto mb-2 opacity-30" />
                No warehouses configured
              </div>
            )}
          </div>
        )}

        {tab === 'low-stock' && (
          <div className="card overflow-hidden">
            <div className="flex items-center gap-2 p-4 border-b border-slate-100 bg-warning-bg">
              <AlertTriangle className="w-4 h-4 text-warning" />
              <span className="text-sm font-medium text-warning">{lowStock.length} items need restocking</span>
            </div>
            <table className="table">
              <thead>
                <tr>
                  <th>Item</th>
                  <th>Warehouse</th>
                  <th className="text-right">Current Qty</th>
                  <th className="text-right">Reorder Point</th>
                  <th>Status</th>
                  <th className="text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {lowStock.map(item => (
                  <tr key={item.id}>
                    <td>
                      <div className="font-medium text-ink">{item.name}</div>
                      <div className="text-xs text-ink-muted font-mono">{item.sku}</div>
                    </td>
                    <td className="text-ink-secondary text-sm">{item.warehouse_name || '—'}</td>
                    <td className="text-right font-bold text-danger">{item.quantity}</td>
                    <td className="text-right text-ink-secondary">{item.reorder_point}</td>
                    <td><StockBadge qty={item.quantity} threshold={item.reorder_point} /></td>
                    <td>
                      <div className="flex justify-end">
                        <button onClick={() => setAdjustItem(item)} className="btn-primary py-1 text-xs gap-1.5">
                          <Plus className="w-3 h-3" />
                          Restock
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {lowStock.length === 0 && (
                  <tr><td colSpan={6} className="text-center py-12 text-ink-muted">All items are well stocked</td></tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {adjustItem && <AdjustModal item={adjustItem} onClose={() => setAdjustItem(null)} />}
      {showAdd && <AddItemModal warehouses={warehouses as Warehouse[]} onClose={() => setShowAdd(false)} />}
    </div>
  )
}
