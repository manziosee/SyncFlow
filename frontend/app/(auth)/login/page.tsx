'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Eye, EyeOff, Loader2, ArrowRight, Sparkles } from 'lucide-react'
import { useAuth } from '@/lib/auth-context'
import toast from 'react-hot-toast'

export default function LoginPage() {
  const { login, isAuthenticated, isLoading } = useAuth()
  const router = useRouter()
  const [form, setForm] = useState({ email: '', password: '' })
  const [showPw, setShowPw] = useState(false)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!isLoading && isAuthenticated) router.replace('/dashboard')
  }, [isAuthenticated, isLoading, router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.email || !form.password) {
      toast.error('Please fill in all fields')
      return
    }
    setLoading(true)
    try {
      await login(form.email, form.password)
      router.replace('/dashboard')
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { error?: string } } })?.response?.data?.error
      toast.error(msg || 'Invalid credentials')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="w-full">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white mb-1.5">Welcome back</h1>
        <p className="text-slate-400 text-sm">Sign in to your SyncFlow workspace</p>
      </div>

      {/* Demo shortcut */}
      <button
        type="button"
        onClick={() => {
          setForm({ email: 'admin@syncflow.io', password: 'password123' })
          toast.success('Demo credentials filled — click Sign in')
        }}
        className="w-full mb-6 flex items-center gap-3 bg-primary-500/8 hover:bg-primary-500/14 border border-primary-500/25 hover:border-primary-500/45 rounded-2xl px-4 py-3.5 text-left transition-all group"
      >
        <div className="w-8 h-8 rounded-xl bg-primary-500/20 flex items-center justify-center shrink-0">
          <Sparkles className="w-4 h-4 text-primary-400" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-primary-300 text-xs font-semibold group-hover:text-primary-200 transition-colors">
            Try the live demo — click to fill credentials
          </p>
          <p className="text-slate-500 text-[11px] mt-0.5">admin@syncflow.io · password123</p>
        </div>
        <ArrowRight className="w-3.5 h-3.5 text-primary-500/60 group-hover:text-primary-400 group-hover:translate-x-0.5 transition-all shrink-0" />
      </button>

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Email */}
        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-2">
            Email address
          </label>
          <input
            type="email"
            autoComplete="email"
            value={form.email}
            onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
            placeholder="you@company.com"
            className="w-full bg-slate-800/70 border border-slate-700/80 hover:border-slate-600 rounded-xl px-4 py-3 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 transition-all"
          />
        </div>

        {/* Password */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="block text-xs font-semibold text-slate-300">Password</label>
            <button type="button" className="text-[11px] text-primary-400 hover:text-primary-300 transition-colors">
              Forgot password?
            </button>
          </div>
          <div className="relative">
            <input
              type={showPw ? 'text' : 'password'}
              autoComplete="current-password"
              value={form.password}
              onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
              placeholder="••••••••"
              className="w-full bg-slate-800/70 border border-slate-700/80 hover:border-slate-600 rounded-xl px-4 py-3 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 transition-all pr-11"
            />
            <button
              type="button"
              onClick={() => setShowPw(v => !v)}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
            >
              {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full flex items-center justify-center gap-2.5 bg-primary-500 hover:bg-primary-400 disabled:opacity-60 disabled:cursor-not-allowed text-white font-semibold rounded-xl py-3 text-sm transition-all shadow-lg shadow-primary-500/25 hover:shadow-primary-500/40 mt-2"
        >
          {loading ? (
            <><Loader2 className="w-4 h-4 animate-spin" />Signing in…</>
          ) : (
            <>Sign in <ArrowRight className="w-4 h-4" /></>
          )}
        </button>
      </form>

      <div className="mt-6 flex items-center gap-3">
        <div className="flex-1 h-px bg-slate-800" />
        <span className="text-slate-600 text-xs">or</span>
        <div className="flex-1 h-px bg-slate-800" />
      </div>

      <p className="text-center text-slate-500 text-sm mt-6">
        Don&apos;t have an account?{' '}
        <Link href="/register" className="text-primary-400 hover:text-primary-300 font-semibold transition-colors">
          Create workspace
        </Link>
      </p>
    </div>
  )
}
