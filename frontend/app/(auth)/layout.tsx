import Link from 'next/link'
import { Zap, BarChart3, Shield, Zap as ZapIcon, Globe } from 'lucide-react'

const FEATURES = [
  { icon: BarChart3, text: 'Real-time CEO dashboard with live KPIs' },
  { icon: Shield, text: 'Role-based access across every module' },
  { icon: ZapIcon, text: 'AI-powered commands in plain language' },
  { icon: Globe, text: 'Multi-warehouse, multi-fleet operations' },
]

const STATS = [
  { value: '48.7M', label: 'RWF tracked monthly' },
  { value: '6', label: 'Modules integrated' },
  { value: '< 200ms', label: 'Real-time sync' },
]

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex">
      {/* Left panel — brand */}
      <div className="hidden lg:flex lg:w-[52%] bg-slate-950 flex-col relative overflow-hidden">
        {/* Background decoration */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,rgba(34,197,94,0.12)_0%,transparent_60%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,rgba(99,102,241,0.08)_0%,transparent_60%)]" />
        {/* Subtle dot grid */}
        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage: 'radial-gradient(circle, #fff 1px, transparent 1px)',
            backgroundSize: '28px 28px',
          }}
        />

        <div className="relative flex flex-col h-full px-12 py-10">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 w-fit">
            <div className="w-9 h-9 bg-primary-500 rounded-xl flex items-center justify-center shadow-lg shadow-primary-500/30">
              <Zap className="w-5 h-5 text-white" />
            </div>
            <span className="text-white font-bold text-lg tracking-tight">SyncFlow</span>
          </Link>

          {/* Headline */}
          <div className="mt-auto mb-10">
            <p className="text-primary-400 text-sm font-semibold tracking-wide uppercase mb-4">
              Enterprise Resource Planning
            </p>
            <h2 className="text-4xl font-bold text-white leading-tight mb-5">
              One platform.<br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-400 to-emerald-300">
                Every operation.
              </span>
            </h2>
            <p className="text-slate-400 text-base leading-relaxed max-w-sm">
              Manage invoices, inventory, payroll, fleet, and customers — all connected, all real-time.
            </p>

            {/* Features */}
            <div className="mt-8 space-y-3.5">
              {FEATURES.map(({ icon: Icon, text }) => (
                <div key={text} className="flex items-center gap-3">
                  <div className="w-7 h-7 rounded-lg bg-primary-500/15 border border-primary-500/20 flex items-center justify-center shrink-0">
                    <Icon className="w-3.5 h-3.5 text-primary-400" />
                  </div>
                  <span className="text-slate-300 text-sm">{text}</span>
                </div>
              ))}
            </div>

            {/* Stats row */}
            <div className="mt-10 pt-8 border-t border-slate-800 grid grid-cols-3 gap-4">
              {STATS.map(({ value, label }) => (
                <div key={label}>
                  <div className="text-xl font-bold text-white">{value}</div>
                  <div className="text-xs text-slate-500 mt-0.5">{label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Bottom quote */}
          <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5">
            <p className="text-slate-300 text-sm leading-relaxed italic">
              &ldquo;SyncFlow gave us one view of everything — from warehouse stock to payroll — and it updates as it happens.&rdquo;
            </p>
            <div className="flex items-center gap-2.5 mt-3.5">
              <div className="w-7 h-7 rounded-full bg-primary-500/20 border border-primary-500/30 flex items-center justify-center text-primary-300 text-[11px] font-bold">
                AK
              </div>
              <div>
                <p className="text-white text-xs font-semibold">Aline K.</p>
                <p className="text-slate-500 text-[11px]">COO, Inyange Industries</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right panel — auth form */}
      <div className="flex-1 flex flex-col bg-slate-900 relative overflow-hidden">
        {/* Subtle top glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-48 bg-primary-500/6 rounded-full blur-3xl pointer-events-none" />

        {/* Mobile logo */}
        <div className="lg:hidden px-6 pt-6">
          <Link href="/" className="flex items-center gap-2 w-fit">
            <div className="w-8 h-8 bg-primary-500 rounded-xl flex items-center justify-center">
              <Zap className="w-4 h-4 text-white" />
            </div>
            <span className="text-white font-bold text-base">SyncFlow</span>
          </Link>
        </div>

        <div className="flex-1 flex items-center justify-center px-6 py-10">
          <div className="w-full max-w-md">{children}</div>
        </div>

        <p className="text-center text-slate-700 text-[11px] pb-6">
          © 2025 SyncFlow · Real-Time ERP Platform
        </p>
      </div>
    </div>
  )
}
