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
  hint?: string
}

const INITIAL_FORM = { name: '', org_name: '', email: '', password: '' }

const FIELDS: FieldConfig[] = [
  {
    key: 'name',
    label: 'Full name',
    type: 'text',
    placeholder: 'Manzi Osee',
    icon: User,
    autoComplete: 'name',
  },
  {
    key: 'org_name',
    label: 'Organisation name',
    type: 'text',
    placeholder: 'Acme Corp Rwanda',
    icon: Building2,
    autoComplete: 'organization',
  },
  {
    key: 'email',
    label: 'Work email',
    type: 'email',
    placeholder: 'you@company.com',
    icon: Mail,
    autoComplete: 'email',
  },
  {
    key: 'password',
    label: 'Password',
    type: 'password',
    placeholder: 'Min 8 characters',
    icon: Lock,
    autoComplete: 'new-password',
    hint: 'At least 8 characters',
  },
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
        <h1 className="text-2xl font-extrabold text-white mb-1.5 tracking-tight">
          Create your workspace
        </h1>
        <p className="text-slate-400 text-sm">Set up SyncFlow for your organisation in seconds</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {FIELDS.map(({ key, label, type, placeholder, icon: Icon, autoComplete, hint }) => (
          <div key={key}>
            <label
              htmlFor={`field-${key}`}
              className="block text-xs font-semibold text-slate-300 mb-2"
            >
              {label}
            </label>
            <div className="relative">
              <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none">
                <Icon className="w-4 h-4" />
              </div>
              <input
                id={`field-${key}`}
                type={type === 'password' ? (showPw ? 'text' : 'password') : type}
                autoComplete={autoComplete}
                value={form[key]}
                onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
                placeholder={placeholder}
                className="w-full bg-slate-900/80 border border-slate-700/70 hover:border-slate-600 rounded-xl pl-10 pr-4 py-3 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 transition-all"
              />
              {type === 'password' && (
                <button
                  type="button"
                  onClick={() => setShowPw(v => !v)}
                  aria-label={showPw ? 'Hide password' : 'Show password'}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
                >
                  {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              )}
            </div>
            {hint && (
              <p className="mt-1.5 text-[11px] text-slate-600">{hint}</p>
            )}
          </div>
        ))}

        {/* Terms */}
        <p className="text-[11px] text-slate-600 leading-relaxed pt-1">
          By creating an account you agree to our{' '}
          <span className="text-orange-400/80 hover:text-orange-400 cursor-pointer transition-colors">
            Terms of Service
          </span>
          {' '}and{' '}
          <span className="text-orange-400/80 hover:text-orange-400 cursor-pointer transition-colors">
            Privacy Policy
          </span>.
        </p>

        <button
          type="submit"
          disabled={loading}
          className="w-full flex items-center justify-center gap-2.5 bg-orange-500 hover:bg-orange-400 active:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold rounded-xl py-3.5 text-sm transition-all shadow-lg shadow-orange-500/30 hover:shadow-orange-500/50"
        >
          {loading ? (
            <><Loader2 className="w-4 h-4 animate-spin" />Creating account…</>
          ) : (
            <>Create workspace <ArrowRight className="w-4 h-4" /></>
          )}
        </button>
      </form>

      <div className="mt-7 flex items-center gap-3">
        <div className="flex-1 h-px bg-slate-800" />
        <span className="text-slate-600 text-xs font-medium">or</span>
        <div className="flex-1 h-px bg-slate-800" />
      </div>

      <p className="text-center text-slate-500 text-sm mt-6">
        Already have an account?{' '}
        <Link href="/login" className="text-orange-400 hover:text-orange-300 font-semibold transition-colors">
          Sign in
        </Link>
      </p>
    </div>
  )
}
