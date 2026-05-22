'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Eye, EyeOff, Loader2, ArrowRight, Mail, Lock } from 'lucide-react'
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
        <h1 className="text-2xl font-extrabold text-white mb-1.5 tracking-tight">
          Welcome back
        </h1>
        <p className="text-slate-400 text-sm">Sign in to your SyncFlow workspace</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Email */}
        <div>
          <label htmlFor="email" className="block text-xs font-semibold text-slate-300 mb-2">
            Email address
          </label>
          <div className="relative">
            <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none">
              <Mail className="w-4 h-4" />
            </div>
            <input
              id="email"
              type="email"
              autoComplete="email"
              value={form.email}
              onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
              placeholder="you@company.com"
              className="w-full bg-slate-900/80 border border-slate-700/70 hover:border-slate-600 rounded-xl pl-10 pr-4 py-3 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 transition-all"
            />
          </div>
        </div>

        {/* Password */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label htmlFor="password" className="block text-xs font-semibold text-slate-300">
              Password
            </label>
            <button
              type="button"
              className="text-[11px] text-orange-400 hover:text-orange-300 font-medium transition-colors"
            >
              Forgot password?
            </button>
          </div>
          <div className="relative">
            <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none">
              <Lock className="w-4 h-4" />
            </div>
            <input
              id="password"
              type={showPw ? 'text' : 'password'}
              autoComplete="current-password"
              value={form.password}
              onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
              placeholder="••••••••"
              className="w-full bg-slate-900/80 border border-slate-700/70 hover:border-slate-600 rounded-xl pl-10 pr-11 py-3 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 transition-all"
            />
            <button
              type="button"
              onClick={() => setShowPw(v => !v)}
              aria-label={showPw ? 'Hide password' : 'Show password'}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
            >
              {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full flex items-center justify-center gap-2.5 bg-orange-500 hover:bg-orange-400 active:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold rounded-xl py-3.5 text-sm transition-all shadow-lg shadow-orange-500/30 hover:shadow-orange-500/50 mt-2"
        >
          {loading ? (
            <><Loader2 className="w-4 h-4 animate-spin" />Signing in…</>
          ) : (
            <>Sign in <ArrowRight className="w-4 h-4" /></>
          )}
        </button>
      </form>

      <div className="mt-7 flex items-center gap-3">
        <div className="flex-1 h-px bg-slate-800" />
        <span className="text-slate-600 text-xs font-medium">or</span>
        <div className="flex-1 h-px bg-slate-800" />
      </div>

      <p className="text-center text-slate-500 text-sm mt-6">
        Don&apos;t have an account?{' '}
        <Link href="/register" className="text-orange-400 hover:text-orange-300 font-semibold transition-colors">
          Create workspace
        </Link>
      </p>
    </div>
  )
}
