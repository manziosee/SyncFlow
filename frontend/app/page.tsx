import Link from 'next/link'
import {
  ArrowRight, CheckCircle2, Zap, Users, BarChart3,
  Shield, Globe, TrendingUp, Truck, FileText, Brain,
  Package, Star, ChevronRight, Sparkles, Activity,
  DollarSign,
} from 'lucide-react'

const ART_BG =
  'https://images.unsplash.com/photo-1536849460588-696219a9e98d?crop=entropy&cs=srgb&fm=jpg&ixlib=rb-4.1.0&q=85'

const KPI = [
  { label: 'TOTAL REVENUE', value: '48.7M', cents: ' RWF', trend: 7.5, up: true },
  { label: 'INVOICES PAID',  value: '91',    cents: '%',    trend: 11.2, up: true },
  { label: 'FLEET ACTIVE',   value: '8/12',  cents: '',     trend: 5.5,  up: true },
  { label: 'EMPLOYEES',      value: '47',    cents: '',     trend: 3.0,  up: true },
  { label: 'GROWTH MoM',     value: '9.56',  cents: '%',    trend: 2.1,  up: true },
]

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-slate-950 font-sans antialiased">

      {/* ── NAV (floating pill) ───────────────────────────── */}
      <nav className="sticky top-0 z-50 py-3 px-4 sm:px-6">
        <div className="max-w-5xl mx-auto bg-slate-900/95 backdrop-blur-xl border border-white/10 rounded-2xl shadow-lg shadow-black/30 px-6 h-14 grid grid-cols-3 items-center">

          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center shadow-sm shrink-0">
              <span className="text-slate-950 font-black text-base leading-none">n.</span>
            </div>
            <span className="font-bold text-base text-white tracking-tight">SyncFlow</span>
          </div>

          <div className="hidden md:flex items-center justify-center gap-7 text-sm font-medium text-slate-400">
            <a href="#features" className="hover:text-white transition-colors">Features</a>
            <a href="#modules"  className="hover:text-white transition-colors">Modules</a>
            <a href="#pricing"  className="hover:text-white transition-colors">Pricing</a>
          </div>

          <div className="flex items-center justify-end gap-3">
            <Link href="/login" className="text-sm font-semibold text-slate-400 hover:text-white transition-colors hidden sm:block">
              Sign In
            </Link>
            <Link href="/register" className="flex items-center gap-1.5 bg-orange-500 hover:bg-orange-400 text-white text-sm font-bold px-4 py-2 rounded-xl transition-colors shadow-md shadow-orange-500/30">
              Get Started
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </nav>

      {/* ── HERO ─────────────────────────────────────────── */}
      <section className="relative overflow-hidden min-h-[520px]">
        {/* Abstract art background */}
        <img
          src={ART_BG}
          alt=""
          aria-hidden="true"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="hero-overlay absolute inset-0" aria-hidden="true" />

        {/* Content */}
        <div className="relative z-10 flex flex-col px-6 pt-20 pb-0 max-w-5xl mx-auto">
          {/* Badge */}
          <div className="flex mb-6">
            <div className="inline-flex items-center gap-2 bg-white/10 border border-white/15 rounded-full px-4 py-1.5 backdrop-blur-sm">
              <span className="w-1.5 h-1.5 bg-orange-400 rounded-full animate-pulse" />
              <span className="text-orange-300 text-xs font-semibold tracking-wide uppercase">Real-Time · Multiplayer · AI-Powered</span>
            </div>
          </div>

          {/* Headline */}
          <h1 className="text-5xl md:text-[68px] font-extrabold text-white leading-[1.06] tracking-tight mb-5 max-w-3xl">
            Overview for{' '}
            <span className="text-orange-400">your business</span>
          </h1>

          <p className="text-lg text-white/65 max-w-xl mb-10 leading-relaxed">
            SyncFlow connects invoicing, inventory, payroll, fleet, and CRM — live,
            in one screen, built for how African businesses actually work.
          </p>

          <div className="flex flex-col sm:flex-row items-start gap-4 mb-0">
            <Link
              href="/login"
              className="flex items-center gap-2 bg-orange-500 hover:bg-orange-400 text-white font-bold text-base px-8 py-3.5 rounded-xl shadow-xl shadow-orange-500/30 hover:shadow-orange-500/50 transition-all"
            >
              Try Demo — Free
              <ArrowRight className="w-5 h-5" />
            </Link>
            <a
              href="#features"
              className="flex items-center gap-2 text-white/80 font-semibold text-base px-8 py-3.5 rounded-xl border border-white/15 hover:bg-white/8 transition-all"
            >
              <Sparkles className="w-4 h-4 text-orange-400" />
              See Features
            </a>
          </div>

          {/* KPI strip — same style as in-app HeroHeader */}
          <div className="flex gap-2 mt-10 overflow-x-auto no-scrollbar -mx-2 px-2">
            {KPI.map((m) => (
              <div
                key={m.label}
                className="flex-1 min-w-[130px] bg-white/90 rounded-t-xl px-4 pt-3 pb-3 flex flex-col gap-1.5 border border-white/50 border-b-0"
              >
                <span className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider leading-none">{m.label}</span>
                <div className="flex items-baseline gap-0.5">
                  <span className="text-base font-bold text-gray-900 leading-none">{m.value}</span>
                  <span className="text-xs font-semibold text-gray-500">{m.cents}</span>
                </div>
                <div className="flex items-center gap-1 text-[11px] font-semibold text-emerald-600">
                  <svg className="w-3 h-3" viewBox="0 0 12 12" fill="currentColor" aria-hidden="true">
                    <path d="M6 2.5l4 5H2l4-5z" />
                  </svg>
                  {m.trend}%
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── APP PREVIEW (3 col cards) ─────────────────────── */}
      <section className="bg-white py-16">
        <div className="max-w-5xl mx-auto px-6">
          <div className="text-center mb-10">
            <p className="text-xs font-bold text-orange-500 uppercase tracking-widest mb-2">Live Preview</p>
            <h2 className="text-3xl font-extrabold text-slate-900 mb-3 tracking-tight">Everything connected, right now</h2>
            <p className="text-slate-500 text-base max-w-xl mx-auto">No page refreshes. No waiting. Data flows the moment it changes.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-4">
            {/* Accounts card preview */}
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
              <div className="flex items-center justify-between mb-4">
                <span className="font-bold text-slate-900 text-sm">Accounts</span>
                <span className="text-xs text-slate-400 bg-slate-50 border border-slate-100 rounded-lg px-2 py-1">4 connected</span>
              </div>
              {[
                { name: 'BK Group', code: '*2349', amount: '235,665', trend: '+1.2%', color: 'bg-blue-500' },
                { name: 'Equity Bank', code: '*9907', amount: '851,099', trend: '+96.3%', color: 'bg-orange-500' },
                { name: 'MTN MoMo', code: '*6976', amount: '9,085', trend: '+0.3%', color: 'bg-yellow-400' },
              ].map(a => (
                <div key={a.name} className="flex items-center justify-between py-2.5 border-b border-slate-50 last:border-0">
                  <div className="flex items-center gap-2.5">
                    <div className={`w-7 h-7 ${a.color} rounded-lg flex items-center justify-center text-white text-[10px] font-bold shrink-0`}>
                      {a.name[0]}
                    </div>
                    <div>
                      <div className="text-xs font-semibold text-slate-800">{a.name}</div>
                      <div className="text-[10px] text-slate-400">{a.code}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs font-bold text-slate-900">{a.amount}</div>
                    <div className="text-[10px] text-emerald-500 font-semibold">{a.trend}</div>
                  </div>
                </div>
              ))}
            </div>

            {/* Cashflow card preview */}
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
              <div className="flex items-center justify-between mb-4">
                <span className="font-bold text-slate-900 text-sm">Cashflow</span>
                <span className="text-[10px] font-semibold text-orange-600 bg-orange-50 border border-orange-100 rounded-lg px-2 py-1">Live</span>
              </div>
              <div className="space-y-2 mb-4">
                <div className="flex justify-between items-center">
                  <span className="text-xs text-slate-500">Income</span>
                  <span className="text-sm font-bold text-emerald-600">552,230 RWF</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs text-slate-500">Outcome</span>
                  <span className="text-sm font-bold text-red-500">-200,340 RWF</span>
                </div>
              </div>
              <div className="bg-orange-50 border border-orange-100 rounded-xl px-3 py-2.5 flex items-center gap-2 mb-4">
                <div className="w-4 h-4 text-orange-500 shrink-0">⚠</div>
                <span className="text-[11px] text-orange-700 font-medium">Risk of cash gap on Mar 25th</span>
              </div>
              <div className="bg-slate-900 rounded-xl px-4 py-3">
                <div className="text-[10px] text-slate-400 mb-1">TOTAL EXPECTED BALANCE</div>
                <div className="text-lg font-black text-white">1,426,230 RWF</div>
              </div>
            </div>

            {/* Live activity preview */}
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
              <div className="flex items-center justify-between mb-4">
                <span className="font-bold text-slate-900 text-sm">Live Activity</span>
                <div className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
                  <span className="text-[10px] text-emerald-600 font-semibold">Real-time</span>
                </div>
              </div>
              <div className="space-y-3">
                {[
                  { type: 'bg-emerald-400', text: 'Invoice #043 approved — MTN Rwanda', time: '2m ago' },
                  { type: 'bg-orange-400',  text: 'Cement bags below reorder point', time: '18m ago' },
                  { type: 'bg-blue-400',    text: 'Vehicle RAB 001A — position updated', time: '1h ago' },
                  { type: 'bg-purple-400',  text: 'May payroll processed — 47 employees', time: '3h ago' },
                ].map((ev, i) => (
                  <div key={i} className="flex items-start gap-2.5">
                    <span className={`w-1.5 h-1.5 rounded-full mt-1.5 shrink-0 ${ev.type}`} />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-slate-700 leading-snug">{ev.text}</p>
                      <p className="text-[10px] text-slate-400 mt-0.5">{ev.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── FEATURES ─────────────────────────────────────── */}
      <section id="features" className="bg-slate-950 py-20">
        <div className="max-w-5xl mx-auto px-6">
          <div className="text-center mb-14">
            <span className="inline-flex items-center gap-1.5 text-xs font-bold text-orange-400 uppercase tracking-widest bg-orange-500/10 border border-orange-500/20 rounded-full px-3 py-1 mb-4">
              Features
            </span>
            <h2 className="text-4xl font-extrabold text-white mb-4 tracking-tight">
              Everything your business needs
            </h2>
            <p className="text-slate-400 text-lg max-w-xl mx-auto">
              One platform. Every module. No more switching between tools.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              {
                icon: FileText, color: 'text-emerald-400', bg: 'bg-emerald-500/10',
                title: 'Collaborative Invoicing',
                desc: 'Multiple accountants edit the same invoice live. Cursor presence, field-level sync, approval workflow.',
                tags: ['Real-time sync', 'Approval flow'],
              },
              {
                icon: BarChart3, color: 'text-blue-400', bg: 'bg-blue-500/10',
                title: 'Live Dashboards',
                desc: 'CEO, warehouse, and regional dashboards that update the instant data changes. No refresh needed.',
                tags: ['Auto-refresh', 'Multi-role views'],
              },
              {
                icon: Truck, color: 'text-amber-400', bg: 'bg-amber-500/10',
                title: 'Fleet GPS Tracking',
                desc: 'Live vehicle positions via WebSocket. See all trucks move on the map. Fuel logging and trip history.',
                tags: ['1Hz GPS', 'Fuel logs'],
              },
              {
                icon: Users, color: 'text-purple-400', bg: 'bg-purple-500/10',
                title: 'HR & Rwanda Payroll',
                desc: 'Automatic PAYE with Rwanda\'s official tax brackets. Pay slips generated with one click.',
                tags: ['Rwanda PAYE', 'Pay slips'],
              },
              {
                icon: Brain, color: 'text-rose-400', bg: 'bg-rose-500/10',
                title: 'AI Command Center',
                desc: 'Ask in plain English — "what\'s our inventory value?" — get instant structured answers.',
                tags: ['Claude AI', 'Natural language'],
              },
              {
                icon: Shield, color: 'text-slate-400', bg: 'bg-white/5',
                title: 'Event Sourcing',
                desc: 'Every change is an immutable event. Full audit trail, time-travel debugging, compliance-ready.',
                tags: ['CQRS', 'Full audit trail'],
              },
            ].map(({ icon: Icon, color, bg, title, desc, tags }) => (
              <div key={title} className="group bg-white/5 border border-white/8 hover:border-white/15 rounded-2xl p-6 transition-all hover:bg-white/8">
                <div className={`w-10 h-10 ${bg} rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                  <Icon className={`w-5 h-5 ${color}`} />
                </div>
                <h3 className="text-sm font-bold text-white mb-2">{title}</h3>
                <p className="text-slate-400 text-xs leading-relaxed mb-4">{desc}</p>
                <div className="flex flex-wrap gap-1.5">
                  {tags.map(t => (
                    <span key={t} className="text-[10px] font-medium text-slate-500 bg-white/5 border border-white/8 rounded-full px-2 py-0.5">{t}</span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── MODULES ──────────────────────────────────────── */}
      <section id="modules" className="bg-slate-900 py-20">
        <div className="max-w-5xl mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-14 items-center">
            <div>
              <span className="inline-flex items-center gap-1.5 text-xs font-bold text-orange-400 uppercase tracking-widest bg-orange-500/10 border border-orange-500/20 rounded-full px-3 py-1 mb-5">
                All-in-One Platform
              </span>
              <h2 className="text-4xl font-extrabold text-white mb-5 tracking-tight leading-tight">
                Every module,<br />
                <span className="text-orange-400">one unified system</span>
              </h2>
              <p className="text-slate-400 text-base mb-8 leading-relaxed">
                No more switching between six different tools. SyncFlow integrates everything
                into one real-time platform — built for how African businesses actually work.
              </p>

              <div className="grid grid-cols-2 gap-2 mb-8">
                {[
                  { icon: FileText, label: 'Accounting & Invoicing' },
                  { icon: Package,  label: 'Inventory & Warehouses' },
                  { icon: Users,    label: 'HR & Rwanda Payroll' },
                  { icon: Globe,    label: 'CRM & Customers' },
                  { icon: Truck,    label: 'Fleet & GPS Tracking' },
                  { icon: Brain,    label: 'AI Natural Language' },
                  { icon: BarChart3,label: 'Live Dashboards' },
                  { icon: Shield,   label: 'Event Sourcing Audit' },
                ].map(({ icon: Icon, label }) => (
                  <div key={label} className="flex items-center gap-2.5 text-xs font-medium text-slate-300 bg-white/5 border border-white/8 rounded-xl px-3 py-2.5 hover:bg-white/8 transition-colors">
                    <Icon className="w-3.5 h-3.5 text-orange-400 shrink-0" />
                    {label}
                  </div>
                ))}
              </div>

              <Link href="/register" className="inline-flex items-center gap-2 bg-orange-500 hover:bg-orange-400 text-white font-bold px-6 py-3 rounded-xl transition-colors shadow-lg shadow-orange-500/25">
                Start Free Trial
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {[
                { label: 'Total Revenue', value: '48.7M RWF', sub: '+18% this month', icon: TrendingUp, glow: 'shadow-orange-500/15' },
                { label: 'Active Vehicles', value: '8 / 12', sub: '3 on trip now', icon: Truck, glow: 'shadow-blue-500/15' },
                { label: 'Invoices Paid', value: '91%', sub: '62 of 68 approved', icon: FileText, glow: 'shadow-emerald-500/15' },
                { label: 'Team Members', value: '47 Staff', sub: '6 departments', icon: Users, glow: 'shadow-purple-500/15' },
              ].map(({ label, value, sub, icon: Icon, glow }) => (
                <div key={label} className={`bg-white/5 border border-white/10 rounded-2xl p-5 hover:bg-white/8 transition-colors shadow-lg ${glow}`}>
                  <div className="w-8 h-8 bg-orange-500/15 rounded-lg flex items-center justify-center mb-3">
                    <Icon className="w-4 h-4 text-orange-400" />
                  </div>
                  <div className="text-2xl font-extrabold text-white mb-0.5">{value}</div>
                  <div className="text-xs text-slate-500 mb-1">{label}</div>
                  <div className="text-xs text-orange-400 font-medium">{sub}</div>
                </div>
              ))}
              <div className="col-span-2 flex items-center gap-2 bg-orange-500/10 border border-orange-500/20 rounded-xl px-4 py-3">
                <span className="w-2 h-2 bg-orange-400 rounded-full animate-pulse shrink-0" />
                <span className="text-sm text-orange-300 font-medium">Invoice #003 being edited by Amina and Celestin — live</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── TESTIMONIALS ──────────────────────────────────── */}
      <section className="bg-slate-950 py-20">
        <div className="max-w-5xl mx-auto px-6">
          <div className="text-center mb-14">
            <h2 className="text-4xl font-extrabold text-white mb-3 tracking-tight">Loved across Africa</h2>
            <p className="text-slate-400 text-lg">Real feedback from teams who moved their business to SyncFlow.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-5">
            {[
              {
                name: 'Jean-Pierre Habimana', role: 'CFO, Kigali Trading Co.', avatar: 'JH',
                text: 'Before SyncFlow, finance sent Excel files over WhatsApp. Now three accountants edit invoices simultaneously. Total game changer.',
              },
              {
                name: 'Amina Uwimana', role: 'Operations Manager, BuildRW', avatar: 'AU',
                text: 'The live fleet map is incredible. I see all 20 trucks in real-time, get alerts when fuel is logged, and run utilization reports with one click.',
              },
              {
                name: 'David Nkusi', role: 'CEO, AgriPro Rwanda', avatar: 'DN',
                text: 'I just type "what\'s our total overdue amount this month?" and get the answer instantly. The AI is genuinely useful, not a gimmick.',
              },
            ].map(({ name, role, avatar, text }) => (
              <div key={name} className="bg-white/5 border border-white/8 rounded-2xl p-6 hover:bg-white/8 transition-colors">
                <div className="flex gap-0.5 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                  ))}
                </div>
                <p className="text-slate-300 text-sm leading-relaxed mb-6">"{text}"</p>
                <div className="flex items-center gap-3 pt-4 border-t border-white/8">
                  <div className="w-8 h-8 bg-orange-500/20 rounded-full flex items-center justify-center text-orange-300 font-bold text-xs shrink-0">{avatar}</div>
                  <div>
                    <div className="text-sm font-semibold text-white">{name}</div>
                    <div className="text-xs text-slate-500">{role}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── PRICING ───────────────────────────────────────── */}
      <section id="pricing" className="bg-slate-900 py-20">
        <div className="max-w-4xl mx-auto px-6">
          <div className="text-center mb-14">
            <span className="inline-flex items-center gap-1.5 text-xs font-bold text-orange-400 uppercase tracking-widest bg-orange-500/10 border border-orange-500/20 rounded-full px-3 py-1 mb-4">
              Pricing
            </span>
            <h2 className="text-4xl font-extrabold text-white mb-3 tracking-tight">Simple, transparent pricing</h2>
            <p className="text-slate-400 text-lg">Start free. Scale as you grow. No hidden fees.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-5">
            {[
              {
                name: 'Starter', badge: null, dark: false,
                price: 'Free', period: '',
                desc: 'For small teams just getting started.',
                features: ['Up to 5 users', '1 warehouse', 'Basic invoicing', '30-day history'],
                cta: 'Get Started Free', href: '/register',
              },
              {
                name: 'Business', badge: 'Most Popular', dark: true,
                price: '99,000', period: 'RWF/mo',
                desc: 'Full power for growing businesses.',
                features: ['Up to 50 users', 'Unlimited warehouses', 'Fleet GPS tracking', 'HR & Rwanda Payroll', 'AI commands (Claude)'],
                cta: 'Start Free Trial', href: '/register',
              },
              {
                name: 'Enterprise', badge: null, dark: false,
                price: 'Custom', period: '',
                desc: 'For large organisations with custom needs.',
                features: ['Unlimited users', 'Custom modules', 'SLA guarantee', 'Dedicated CSM'],
                cta: 'Contact Sales', href: '/login',
              },
            ].map(({ name, badge, dark, price, period, desc, features, cta, href }) => (
              <div key={name} className={`relative rounded-2xl p-6 border transition-all hover:-translate-y-0.5 ${
                dark
                  ? 'bg-orange-500/10 border-orange-500/40 shadow-xl shadow-orange-500/10'
                  : 'bg-white/5 border-white/10 hover:border-white/20'
              }`}>
                {badge && (
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-orange-500 text-white text-[11px] font-bold px-4 py-1 rounded-full">
                    {badge}
                  </div>
                )}
                <div className={`text-xs font-bold uppercase tracking-widest mb-2 ${dark ? 'text-orange-400' : 'text-slate-500'}`}>{name}</div>
                <div className="flex items-end gap-1.5 mb-1">
                  <span className="text-4xl font-black text-white">{price}</span>
                  {period && <span className="text-sm mb-1.5 text-slate-500">{period}</span>}
                </div>
                <p className="text-sm mb-5 text-slate-400">{desc}</p>
                <ul className="space-y-2.5 mb-6">
                  {features.map(f => (
                    <li key={f} className="flex items-center gap-2.5 text-sm text-slate-300">
                      <CheckCircle2 className={`w-4 h-4 shrink-0 ${dark ? 'text-orange-400' : 'text-emerald-400'}`} />
                      {f}
                    </li>
                  ))}
                </ul>
                <Link href={href} className={`flex items-center justify-center gap-2 w-full py-2.5 rounded-xl font-bold text-sm transition-all ${
                  dark
                    ? 'bg-orange-500 hover:bg-orange-400 text-white shadow-lg shadow-orange-500/25'
                    : 'bg-white/10 hover:bg-white/15 text-white'
                }`}>
                  {cta}
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA BANNER ────────────────────────────────────── */}
      <section className="relative overflow-hidden py-24 bg-slate-950">
        <img src={ART_BG} alt="" aria-hidden="true" className="absolute inset-0 w-full h-full object-cover opacity-20" />
        <div className="cta-overlay absolute inset-0" aria-hidden="true" />
        <div className="relative max-w-2xl mx-auto px-6 text-center">
          <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-xl">
            <span className="text-slate-950 font-black text-xl leading-none">n.</span>
          </div>
          <h2 className="text-4xl font-extrabold text-white mb-4 tracking-tight">
            Ready to transform<br /><span className="text-orange-400">your operations?</span>
          </h2>
          <p className="text-slate-400 text-lg mb-10 leading-relaxed">
            Join African businesses running on SyncFlow. Set up in minutes — no IT team required.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/register" className="flex items-center justify-center gap-2 bg-orange-500 hover:bg-orange-400 text-white font-bold text-base px-8 py-3.5 rounded-xl shadow-lg shadow-orange-500/30 transition-all">
              Start for Free
              <ArrowRight className="w-5 h-5" />
            </Link>
            <a href="mailto:hello@syncflow.rw" className="flex items-center justify-center gap-2 text-slate-300 font-semibold text-base px-8 py-3.5 rounded-xl border border-white/10 hover:bg-white/5 transition-all">
              Talk to Sales
            </a>
          </div>
        </div>
      </section>

      {/* ── FOOTER ────────────────────────────────────────── */}
      <footer className="bg-slate-950 border-t border-white/5 py-12">
        <div className="max-w-5xl mx-auto px-6">
          <div className="grid md:grid-cols-5 gap-8 mb-10">
            <div className="md:col-span-2">
              <div className="flex items-center gap-2.5 mb-4">
                <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center">
                  <span className="text-slate-950 font-black text-sm leading-none">n.</span>
                </div>
                <span className="font-bold text-white">SyncFlow</span>
              </div>
              <p className="text-slate-500 text-sm leading-relaxed max-w-xs">
                Real-time multiplayer ERP for African businesses.
                Default currency: RWF. Timezone: Africa/Kigali.
              </p>
            </div>
            {[
              { title: 'Product', links: ['Features', 'Pricing', 'Changelog', 'Roadmap'] },
              { title: 'Company', links: ['About', 'Blog', 'Careers', 'Contact'] },
              { title: 'Legal', links: ['Privacy', 'Terms', 'Security'] },
            ].map(({ title, links }) => (
              <div key={title}>
                <div className="text-white font-semibold text-sm mb-4">{title}</div>
                <ul className="space-y-2.5">
                  {links.map(l => (
                    <li key={l}><a href="#" className="text-slate-500 hover:text-slate-300 text-sm transition-colors">{l}</a></li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <div className="border-t border-white/5 pt-6 flex flex-col md:flex-row items-center justify-between gap-3">
            <p className="text-slate-600 text-sm">© 2025 SyncFlow Inc. All rights reserved.</p>
            <p className="text-slate-600 text-sm">Built with love for Africa · Kigali, Rwanda</p>
          </div>
        </div>
      </footer>

    </div>
  )
}
