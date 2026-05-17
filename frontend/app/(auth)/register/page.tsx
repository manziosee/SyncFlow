'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Eye, EyeOff, Loader2, ArrowRight, Building2, User, Mail, Lock } from 'lucide-react'
import { authApi } from '@/lib/api'
import { useAuth } from '@/lib/auth-context'
import toast from 'react-hot-toast'

interface FieldConfig {
  key: keyof typeof INITIAL_FORM
  label: string
  type: string
  placeholder: string
  icon: React.ElementType
  autoComplete?: string
}

const INITIAL_FORM = { name: '', org_name: '', email: '', password: '' }

const FIELDS: FieldConfig[] = [
  { key: 'name',     label: 'Full name',          type: 'text',     placeholder: 'Manzi Osee',       icon: User,      autoComplete: 'name' },
  { key: 'org_name', label: 'Organisation name',  type: 'text',     placeholder: 'Acme Corp Rwanda', icon: Building2, autoComplete: 'organization' },
  { key: 'email',    label: 'Work email',          type: 'email',    placeholder: 'you@company.com',  icon: Mail,      autoComplete: 'email' },
  { key: 'password', label: 'Password',            type: 'password', placeholder: 'Min 8 characters', icon: Lock,      autoComplete: 'new-password' },
]

export default function RegisterPage() {
  const { login } = useAuth()
  const router = useRouter()
  const [form, setForm] = useState(INITIAL_FORM)
  const [showPw, setShowPw] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.name || !form.email || !form.password || !form.org_name) {
      toast.error('Please fill in all fields')
      return
    }
    if (form.password.length < 8) {
      toast.error('Password must be at least 8 characters')
      return
    }
    setLoading(true)
    try {
      await authApi.register(form)
      await login(form.email, form.password)
      router.replace('/dashboard')
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { error?: string } } })?.response?.data?.error
      toast.error(msg || 'Registration failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="w-full">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white mb-1.5">Create your workspace</h1>
        <p className="text-slate-400 text-sm">Set up SyncFlow for your organisation in seconds</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {FIELDS.map(({ key, label, type, placeholder, icon: Icon, autoComplete }) => (
          <div key={key}>
            <label className="block text-xs font-semibold text-slate-300 mb-2">{label}</label>
            <div className="relative">
              <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none">
                <Icon className="w-4 h-4" />
              </div>
              <input
                type={type === 'password' ? (showPw ? 'text' : 'password') : type}
                autoComplete={autoComplete}
                value={form[key]}
                onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
                placeholder={placeholder}
                className="w-full bg-slate-800/70 border border-slate-700/80 hover:border-slate-600 rounded-xl pl-10 pr-4 py-3 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 transition-all"
              />
              {type === 'password' && (
                <button
                  type="button"
                  onClick={() => setShowPw(v => !v)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
                >
                  {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              )}
            </div>
          </div>
        ))}

        {/* Terms */}
        <p className="text-[11px] text-slate-600 leading-relaxed pt-1">
          By creating an account you agree to our{' '}
          <span className="text-slate-500 hover:text-slate-400 cursor-pointer transition-colors">Terms of Service</span>
          {' '}and{' '}
          <span className="text-slate-500 hover:text-slate-400 cursor-pointer transition-colors">Privacy Policy</span>.
        </p>

        <button
          type="submit"
          disabled={loading}
          className="w-full flex items-center justify-center gap-2.5 bg-primary-500 hover:bg-primary-400 disabled:opacity-60 disabled:cursor-not-allowed text-white font-semibold rounded-xl py-3 text-sm transition-all shadow-lg shadow-primary-500/25 hover:shadow-primary-500/40"
        >
          {loading ? (
            <><Loader2 className="w-4 h-4 animate-spin" />Creating account…</>
          ) : (
            <>Create workspace <ArrowRight className="w-4 h-4" /></>
          )}
        </button>
      </form>

      <div className="mt-6 flex items-center gap-3">
        <div className="flex-1 h-px bg-slate-800" />
        <span className="text-slate-600 text-xs">or</span>
        <div className="flex-1 h-px bg-slate-800" />
      </div>

      <p className="text-center text-slate-500 text-sm mt-6">
        Already have an account?{' '}
        <Link href="/login" className="text-primary-400 hover:text-primary-300 font-semibold transition-colors">
          Sign in
        </Link>
      </p>
    </div>
  )
}
