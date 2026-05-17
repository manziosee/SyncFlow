'use client'

import { useState } from 'react'
import { Search, Bell, RefreshCw, ChevronDown, Zap } from 'lucide-react'
import { useAuth } from '@/lib/auth-context'
import { aiApi } from '@/lib/api'
import toast from 'react-hot-toast'

interface TopbarProps {
  title: string
  subtitle?: string
}

export default function Topbar({ title, subtitle }: TopbarProps) {
  const { user } = useAuth()
  const [query, setQuery] = useState('')
  const [aiLoading, setAiLoading] = useState(false)

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
      {/* Page title */}
      <div className="flex-1 min-w-0">
        <h1 className="text-base font-bold text-ink truncate">{title}</h1>
        {subtitle && <p className="text-xs text-ink-muted">{subtitle}</p>}
      </div>

      {/* AI search bar */}
      <form onSubmit={handleAISearch} className="hidden md:flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 w-72 group focus-within:border-primary-400 focus-within:bg-white transition-all">
        <Search className="w-4 h-4 text-ink-muted shrink-0" />
        <input
          type="text"
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder='Ask AI: "Show overdue invoices"'
          className="flex-1 bg-transparent text-sm text-ink placeholder:text-ink-muted focus:outline-none"
        />
        {aiLoading ? (
          <RefreshCw className="w-3.5 h-3.5 text-primary-500 animate-spin" />
        ) : (
          <div className="flex items-center gap-0.5 bg-primary-100 text-primary-600 text-[10px] font-bold px-1.5 py-0.5 rounded">
            <Zap className="w-2.5 h-2.5" />
            AI
          </div>
        )}
      </form>

      {/* Notifications */}
      <button className="relative w-9 h-9 flex items-center justify-center rounded-lg hover:bg-slate-100 transition-colors text-ink-muted hover:text-ink">
        <Bell className="w-5 h-5" />
        <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-danger rounded-full border-2 border-white" />
      </button>

      {/* User pill */}
      <button className="flex items-center gap-2 hover:bg-slate-50 px-2 py-1.5 rounded-lg transition-colors">
        <div className="w-7 h-7 bg-primary-100 rounded-full flex items-center justify-center text-primary-700 font-bold text-xs">
          {user?.name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || 'U'}
        </div>
        <span className="text-sm font-medium text-ink hidden md:block truncate max-w-28">
          {user?.name?.split(' ')[0] || 'User'}
        </span>
        <ChevronDown className="w-3.5 h-3.5 text-ink-muted" />
      </button>
    </header>
  )
}
