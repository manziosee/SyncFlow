import Link from 'next/link'
import { BarChart3, Shield, Brain, Globe, FileText, Truck } from 'lucide-react'

const ART_BG =
  'https://images.unsplash.com/photo-1552043519-6b4dc5347ea9?crop=entropy&cs=srgb&fm=jpg&ixlib=rb-4.1.0&q=85'

const KPI = [
  { label: 'REVENUE',  value: '48.7M', unit: 'RWF' },
  { label: 'INVOICES', value: '91',    unit: '%' },
  { label: 'FLEET',    value: '8/12',  unit: '' },
  { label: 'GROWTH',   value: '9.56',  unit: '%' },
]

const FEATURES = [
  { icon: BarChart3, text: 'Real-time CEO dashboard with live KPIs' },
  { icon: Shield,    text: 'Role-based access across every module' },
  { icon: Brain,     text: 'AI-powered commands in plain language' },
  { icon: Globe,     text: 'Multi-warehouse, multi-fleet operations' },
]

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex">

      {/* ── Left panel — abstract art + brand ─────────── */}
      <div className="hidden lg:flex lg:w-[52%] flex-col relative overflow-hidden">
        {/* Abstract art background */}
        <img
          src={ART_BG}
          alt=""
          aria-hidden="true"
          className="absolute inset-0 w-full h-full object-cover"
        />
        {/* Dark overlay */}
        <div className="hero-overlay absolute inset-0" aria-hidden="true" />

        <div className="relative z-10 flex flex-col h-full px-12 py-10">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 w-fit">
            <div className="w-9 h-9 bg-white rounded-xl flex items-center justify-center shadow-lg shrink-0">
              <span className="text-slate-950 font-black text-base leading-none">n.</span>
            </div>
            <div>
              <div className="text-white font-bold text-base leading-tight">SyncFlow</div>
              <div className="text-white/50 text-[10px]">Financial</div>
            </div>
          </Link>

          {/* Headline */}
          <div className="mt-auto mb-8">
            <p className="text-orange-400 text-xs font-bold tracking-widest uppercase mb-4">
              Enterprise Resource Planning
            </p>
            <h2 className="text-4xl font-extrabold text-white leading-tight mb-5 tracking-tight">
              Overview for{' '}
              <span className="text-orange-400">your business</span>
            </h2>
            <p className="text-white/65 text-base leading-relaxed max-w-sm">
              Manage invoices, inventory, payroll, fleet, and customers — all connected, all real-time.
            </p>

            {/* Feature list */}
            <div className="mt-8 space-y-3">
              {FEATURES.map(({ icon: Icon, text }) => (
                <div key={text} className="flex items-center gap-3">
                  <div className="w-7 h-7 rounded-lg bg-orange-500/20 border border-orange-500/30 flex items-center justify-center shrink-0">
                    <Icon className="w-3.5 h-3.5 text-orange-400" />
                  </div>
                  <span className="text-white/75 text-sm">{text}</span>
                </div>
              ))}
            </div>
          </div>

          {/* KPI strip */}
          <div className="flex gap-2 mb-6">
            {KPI.map(k => (
              <div
                key={k.label}
                className="flex-1 bg-white/90 rounded-xl px-3 pt-2.5 pb-2.5 flex flex-col gap-0.5 border border-white/50"
              >
                <span className="text-[9px] font-bold text-gray-500 uppercase tracking-wider">{k.label}</span>
                <div className="flex items-baseline gap-0.5">
                  <span className="text-sm font-black text-gray-900">{k.value}</span>
                  <span className="text-[10px] font-semibold text-gray-500">{k.unit}</span>
                </div>
                <div className="flex items-center gap-0.5 text-[10px] font-semibold text-emerald-600">
                  <svg className="w-2.5 h-2.5" viewBox="0 0 12 12" fill="currentColor" aria-hidden="true">
                    <path d="M6 2.5l4 5H2l4-5z" />
                  </svg>
                  Live
                </div>
              </div>
            ))}
          </div>

          {/* Quote card */}
          <div className="bg-black/30 backdrop-blur-md border border-white/10 rounded-2xl p-5">
            <p className="text-white/80 text-sm leading-relaxed italic">
              &ldquo;SyncFlow gave us one view of everything — from warehouse stock to payroll — and it updates as it happens.&rdquo;
            </p>
            <div className="flex items-center gap-2.5 mt-3.5">
              <div className="w-7 h-7 rounded-full bg-orange-500/25 border border-orange-500/40 flex items-center justify-center text-orange-300 text-[11px] font-bold shrink-0">
                AK
              </div>
              <div>
                <p className="text-white text-xs font-semibold">Aline K.</p>
                <p className="text-white/50 text-[11px]">COO, Inyange Industries</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Right panel — form ─────────────────────────── */}
      <div className="flex-1 flex flex-col bg-slate-950 relative overflow-hidden">
        {/* Orange glow accent */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-48 bg-orange-500/6 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 right-0 w-64 h-64 bg-orange-500/4 rounded-full blur-3xl pointer-events-none" />

        {/* Mobile logo */}
        <div className="lg:hidden px-6 pt-6">
          <Link href="/" className="flex items-center gap-2 w-fit">
            <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center shrink-0">
              <span className="text-slate-950 font-black text-sm leading-none">n.</span>
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
