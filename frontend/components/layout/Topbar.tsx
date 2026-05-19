'use client'

import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import {
  Search, Bell, RefreshCw, ChevronDown, Zap,
  Settings, LogOut, User, HelpCircle, CheckCheck,
  FileText, Package, Truck, DollarSign, AlertCircle,
} from 'lucide-react'
import { useAuth } from '@/lib/auth-context'
import { aiApi } from '@/lib/api'
import toast from 'react-hot-toast'

interface TopbarProps {
  title: string
  subtitle?: string
}

type Notif = {
  id: string
  read: boolean
  type: 'invoice' | 'stock' | 'fleet' | 'payroll'
  title: string
  message: string
  time: string
}

const INITIAL_NOTIFS: Notif[] = [
  { id: '1', read: false, type: 'invoice', title: 'Invoice #043 approved', message: 'Invoice to MTN Rwanda approved by Alice N.', time: '2 min ago' },
  { id: '2', read: false, type: 'stock', title: 'Low stock alert', message: 'Cement bags dropped below reorder point (12 left).', time: '18 min ago' },
  { id: '3', read: false, type: 'fleet', title: 'Vehicle RAB 001A delayed', message: 'Trip KGL→Musanze is 45 min behind schedule.', time: '1 hr ago' },
  { id: '4', read: true, type: 'payroll', title: 'Payroll run ready', message: 'May 2025 payroll processed. Awaiting approval.', time: '3 hr ago' },
  { id: '5', read: true, type: 'invoice', title: 'Invoice #039 rejected', message: 'BK Group invoice rejected — please review comments.', time: 'Yesterday' },
]

const NOTIF_ICONS: Record<string, React.ElementType> = {
  invoice: FileText, stock: Package, fleet: Truck, payroll: DollarSign,
}

const NOTIF_COLORS: Record<string, string> = {
  invoice: 'bg-primary-100 text-primary-600',
  stock: 'bg-orange-100 text-orange-600',
  fleet: 'bg-blue-100 text-blue-600',
  payroll: 'bg-purple-100 text-purple-600',
}

export default function Topbar({ title, subtitle }: TopbarProps) {
  const { user, logout } = useAuth() as { user: { name?: string; email?: string; role?: string } | null; logout: () => void }
  const [query, setQuery] = useState('')
  const [aiLoading, setAiLoading] = useState(false)
  const [showNotifs, setShowNotifs] = useState(false)
  const [showUser, setShowUser] = useState(false)
  const [notifs, setNotifs] = useState<Notif[]>(INITIAL_NOTIFS)
  const notifsRef = useRef<HTMLDivElement>(null)
  const userRef = useRef<HTMLDivElement>(null)

  const unread = notifs.filter(n => !n.read).length
  const initials = user?.name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || 'U'
  const firstName = user?.name?.split(' ')[0] || 'User'

  useEffect(() => {
    const onDown = (e: MouseEvent) => {
      if (notifsRef.current && !notifsRef.current.contains(e.target as Node)) setShowNotifs(false)
      if (userRef.current && !userRef.current.contains(e.target as Node)) setShowUser(false)
    }
    document.addEventListener('mousedown', onDown)
    return () => document.removeEventListener('mousedown', onDown)
  }, [])

  const markRead = (id: string) => setNotifs(ns => ns.map(n => n.id === id ? { ...n, read: true } : n))
  const markAllRead = () => setNotifs(ns => ns.map(n => ({ ...n, read: true })))

  const handleAISearch = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!query.trim()) return
    setAiLoading(true)
    try {
      const res = await aiApi.command(query)
      toast.success(res.data.message || 'Command executed')
      setQuery('')
    } catch {
      toast.error('AI command failed')
    } finally {
      setAiLoading(false)
    }
  }

  return (
    <header className="h-16 bg-white border-b border-slate-100 flex items-center gap-4 px-6 shrink-0">
      <div className="flex-1 min-w-0">
        <h1 className="text-base font-bold text-ink truncate">{title}</h1>
        {subtitle && <p className="text-xs text-ink-muted">{subtitle}</p>}
      </div>

      {/* AI search */}
      <form onSubmit={handleAISearch} className="hidden md:flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 w-72 focus-within:border-primary-400 focus-within:bg-white transition-all">
        <Search className="w-4 h-4 text-ink-muted shrink-0" />
        <input
          type="text"
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder='Ask AI: "Show overdue invoices"'
          className="flex-1 bg-transparent text-sm text-ink placeholder:text-ink-muted focus:outline-none"
        />
        {aiLoading
          ? <RefreshCw className="w-3.5 h-3.5 text-primary-500 animate-spin" />
          : <div className="flex items-center gap-0.5 bg-primary-100 text-primary-600 text-[10px] font-bold px-1.5 py-0.5 rounded"><Zap className="w-2.5 h-2.5" />AI</div>
        }
      </form>

      {/* ── Notification bell ───────────────────────────── */}
      <div className="relative" ref={notifsRef}>
        <button
          onClick={() => { setShowNotifs(v => !v); setShowUser(false) }}
          className="relative w-9 h-9 flex items-center justify-center rounded-lg hover:bg-slate-100 transition-colors text-ink-muted hover:text-ink"
          aria-label="Notifications"
        >
          <Bell className="w-5 h-5" />
          {unread > 0 && (
            <span className="absolute top-1 right-1 min-w-[16px] h-4 flex items-center justify-center bg-danger rounded-full border-2 border-white text-[9px] font-bold text-white leading-none px-0.5">
              {unread > 9 ? '9+' : unread}
            </span>
          )}
        </button>

        {showNotifs && (
          <div className="absolute right-0 top-full mt-2 w-80 bg-white rounded-2xl shadow-xl border border-slate-100 z-50 overflow-hidden">
            <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-sm text-ink">Notifications</span>
                {unread > 0 && (
                  <span className="text-[10px] font-bold bg-primary-500 text-white px-1.5 py-0.5 rounded-full">
                    {unread} new
                  </span>
                )}
              </div>
              {unread > 0 && (
                <button onClick={markAllRead} className="flex items-center gap-1 text-xs text-primary-600 hover:text-primary-700 font-medium">
                  <CheckCheck className="w-3 h-3" />Mark all read
                </button>
              )}
            </div>

            <div className="max-h-80 overflow-y-auto">
              {notifs.map(n => {
                const Icon = NOTIF_ICONS[n.type] ?? AlertCircle
                return (
                  <button
                    key={n.id}
                    onClick={() => markRead(n.id)}
                    className={`w-full flex items-start gap-3 px-4 py-3 text-left hover:bg-slate-50 transition-colors border-b border-slate-50 last:border-0 ${!n.read ? 'bg-primary-50/40' : ''}`}
                  >
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 mt-0.5 ${NOTIF_COLORS[n.type] ?? 'bg-slate-100 text-slate-500'}`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-1">
                        <span className={`text-xs font-semibold leading-snug ${!n.read ? 'text-ink' : 'text-ink-secondary'}`}>
                          {n.title}
                        </span>
                        {!n.read && <span className="w-1.5 h-1.5 bg-primary-500 rounded-full shrink-0 mt-1.5" />}
                      </div>
                      <p className="text-[11px] text-ink-muted leading-relaxed mt-0.5">{n.message}</p>
                      <p className="text-[10px] text-ink-muted mt-0.5">{n.time}</p>
                    </div>
                  </button>
                )
              })}
            </div>

            <div className="px-4 py-2.5 border-t border-slate-100 bg-slate-50/50">
              <Link href="/settings" onClick={() => setShowNotifs(false)} className="text-xs text-primary-600 hover:text-primary-700 font-medium transition-colors">
                Notification settings →
              </Link>
            </div>
          </div>
        )}
      </div>

      {/* ── User dropdown ───────────────────────────────── */}
      <div className="relative" ref={userRef}>
        <button
          onClick={() => { setShowUser(v => !v); setShowNotifs(false) }}
          className="flex items-center gap-2 hover:bg-slate-50 px-2 py-1.5 rounded-lg transition-colors"
          aria-label="User menu"
        >
          <div className="w-7 h-7 bg-primary-100 rounded-full flex items-center justify-center text-primary-700 font-bold text-xs">
            {initials}
          </div>
          <span className="text-sm font-medium text-ink hidden md:block truncate max-w-28">{firstName}</span>
          <ChevronDown className={`w-3.5 h-3.5 text-ink-muted transition-transform duration-150 ${showUser ? 'rotate-180' : ''}`} />
        </button>

        {showUser && (
          <div className="absolute right-0 top-full mt-2 w-56 bg-white rounded-2xl shadow-xl border border-slate-100 z-50 overflow-hidden">
            <div className="px-4 py-3 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 bg-primary-100 rounded-full flex items-center justify-center text-primary-700 font-bold text-sm shrink-0">
                  {initials}
                </div>
                <div className="min-w-0">
                  <div className="text-sm font-semibold text-ink truncate">{user?.name || 'User'}</div>
                  <div className="text-xs text-ink-muted truncate">
                    {user?.email || user?.role?.replace(/_/g, ' ') || 'Member'}
                  </div>
                </div>
              </div>
            </div>

            <div className="py-1">
              <Link href="/settings" onClick={() => setShowUser(false)} className="flex items-center gap-3 px-4 py-2.5 text-sm text-ink-secondary hover:text-ink hover:bg-slate-50 transition-colors">
                <User className="w-4 h-4 shrink-0" />Profile
              </Link>
              <Link href="/settings" onClick={() => setShowUser(false)} className="flex items-center gap-3 px-4 py-2.5 text-sm text-ink-secondary hover:text-ink hover:bg-slate-50 transition-colors">
                <Settings className="w-4 h-4 shrink-0" />Preferences
              </Link>
              <a href="#" className="flex items-center gap-3 px-4 py-2.5 text-sm text-ink-secondary hover:text-ink hover:bg-slate-50 transition-colors">
                <HelpCircle className="w-4 h-4 shrink-0" />Help & Support
              </a>
            </div>

            <div className="border-t border-slate-100 py-1">
              <button
                onClick={() => { setShowUser(false); logout() }}
                className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-danger hover:bg-red-50 transition-colors"
              >
                <LogOut className="w-4 h-4 shrink-0" />Sign Out
              </button>
            </div>
          </div>
        )}
      </div>
    </header>
  )
}
