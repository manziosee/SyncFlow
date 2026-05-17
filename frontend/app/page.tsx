import Link from 'next/link'
import {
  ArrowRight, CheckCircle2, Zap, Users, BarChart3,
  Shield, Globe, TrendingUp, Truck, FileText, Brain,
  Package, Star, ChevronRight, Sparkles, Lock, Activity
} from 'lucide-react'

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white font-sans antialiased">

      {/* ─── NAV ──────────────────────────────────────────────── */}
      <nav className="sticky top-0 z-50 bg-white/90 backdrop-blur-xl border-b border-slate-100/80">
        <div className="max-w-6xl mx-auto px-6 h-16 grid grid-cols-3 items-center">

          {/* Left — Logo */}
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-primary-500 rounded-lg flex items-center justify-center shadow-sm shadow-primary-500/40">
              <Zap className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-lg text-ink tracking-tight">SyncFlow</span>
          </div>

          {/* Center — Links */}
          <div className="hidden md:flex items-center justify-center gap-7 text-sm font-medium text-ink-secondary">
            <a href="#features" className="hover:text-ink transition-colors">Features</a>
            <a href="#how" className="hover:text-ink transition-colors">How It Works</a>
            <a href="#modules" className="hover:text-ink transition-colors">Modules</a>
            <a href="#pricing" className="hover:text-ink transition-colors">Pricing</a>
          </div>

          {/* Right — CTAs */}
          <div className="flex items-center justify-end gap-3">
            <Link href="/login" className="text-sm font-semibold text-ink-secondary hover:text-ink transition-colors hidden sm:block">
              Sign In
            </Link>
            <Link href="/register" className="flex items-center gap-1.5 bg-ink text-white text-sm font-semibold px-4 py-2 rounded-lg hover:bg-slate-800 transition-colors">
              Get Started
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </nav>

      {/* ─── HERO ─────────────────────────────────────────────── */}
      <section className="relative overflow-hidden bg-slate-950 pt-24 pb-28">
        {/* Dot grid */}
        <div className="absolute inset-0 opacity-20"
          style={{ backgroundImage: 'radial-gradient(circle, #334155 1px, transparent 1px)', backgroundSize: '28px 28px' }} />

        {/* Glows */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-primary-500/8 rounded-full blur-[100px]" />
        <div className="absolute bottom-0 right-1/4 w-[400px] h-[300px] bg-blue-500/6 rounded-full blur-[80px]" />

        <div className="relative max-w-6xl mx-auto px-6">
          {/* Badge */}
          <div className="flex justify-center mb-8">
            <div className="inline-flex items-center gap-2 bg-white/5 border border-white/10 rounded-full px-4 py-1.5">
              <span className="w-1.5 h-1.5 bg-primary-400 rounded-full animate-pulse" />
              <span className="text-primary-400 text-xs font-semibold tracking-wide uppercase">Real-Time · Multiplayer · AI-Powered</span>
            </div>
          </div>

          {/* Headline */}
          <h1 className="text-center text-5xl md:text-7xl font-extrabold text-white leading-[1.08] tracking-tight mb-6">
            The ERP that moves<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-400 via-emerald-300 to-primary-500">
              as fast as you do.
            </span>
          </h1>

          <p className="text-center text-lg text-slate-400 max-w-2xl mx-auto mb-10 leading-relaxed">
            SyncFlow brings real-time collaboration, AI automation, and live analytics
            to your entire business — invoices, inventory, fleet, HR, and more.
          </p>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
            <Link href="/login"
              className="flex items-center gap-2 bg-primary-500 hover:bg-primary-600 text-white font-bold text-base px-8 py-3.5 rounded-xl shadow-lg shadow-primary-500/30 hover:shadow-primary-500/50 transition-all">
              Try Demo — Free
              <ArrowRight className="w-5 h-5" />
            </Link>
            <a href="#features"
              className="flex items-center gap-2 text-slate-300 font-semibold text-base px-8 py-3.5 rounded-xl border border-white/10 hover:bg-white/5 transition-all">
              <Sparkles className="w-4 h-4 text-primary-400" />
              See Features
            </a>
          </div>

          {/* Browser mockup */}
          <div className="relative mx-auto max-w-4xl">
            {/* Glow behind mockup */}
            <div className="absolute inset-0 bg-primary-500/10 blur-3xl rounded-3xl scale-95" />

            <div className="relative rounded-2xl overflow-hidden border border-white/10 shadow-2xl">
              {/* Browser chrome */}
              <div className="bg-slate-800 px-4 py-3 flex items-center gap-3 border-b border-white/5">
                <div className="flex gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-red-500/70" />
                  <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/70" />
                  <div className="w-2.5 h-2.5 rounded-full bg-green-500/70" />
                </div>
                <div className="flex-1 bg-slate-700/60 rounded-md h-5.5 mx-8 flex items-center justify-center" style={{height:'22px'}}>
                  <span className="text-[10px] text-slate-400">app.syncflow.rw/dashboard</span>
                </div>
                <div className="flex items-center gap-1 text-[10px] text-primary-400 font-medium">
                  <span className="w-1.5 h-1.5 bg-primary-400 rounded-full animate-pulse" />
                  Live
                </div>
              </div>

              {/* App preview */}
              <div className="bg-slate-900 flex" style={{height:'320px'}}>
                {/* Sidebar */}
                <div className="w-44 bg-slate-950 py-3 px-2 flex flex-col gap-0.5 shrink-0">
                  <div className="flex items-center gap-2 px-2 py-2 mb-2">
                    <div className="w-5 h-5 bg-primary-500 rounded flex items-center justify-center shrink-0">
                      <Zap className="w-2.5 h-2.5 text-white" />
                    </div>
                    <span className="text-white text-[11px] font-bold">SyncFlow</span>
                  </div>
                  {[
                    { icon: BarChart3, label: 'Dashboard', active: true },
                    { icon: FileText,  label: 'Invoices',  active: false },
                    { icon: Package,   label: 'Inventory', active: false },
                    { icon: Truck,     label: 'Fleet',     active: false },
                    { icon: Users,     label: 'HR & Payroll', active: false },
                    { icon: Brain,     label: 'AI Assistant', active: false },
                  ].map(({ icon: Icon, label, active }) => (
                    <div key={label} className={`flex items-center gap-2 px-2.5 py-1.5 rounded-md text-[10px] font-medium ${active ? 'bg-primary-500/15 text-primary-400' : 'text-slate-500'}`}>
                      <Icon className="w-3 h-3 shrink-0" />
                      {label}
                    </div>
                  ))}
                </div>

                {/* Content */}
                <div className="flex-1 p-4 overflow-hidden">
                  {/* KPI row */}
                  <div className="grid grid-cols-4 gap-2 mb-3">
                    {[
                      { label: 'Revenue', value: '48.7M', unit: 'RWF', color: 'text-primary-400' },
                      { label: 'Invoices', value: '62', unit: 'paid', color: 'text-primary-400' },
                      { label: 'Vehicles', value: '8/12', unit: 'active', color: 'text-blue-400' },
                      { label: 'Employees', value: '47', unit: 'total', color: 'text-purple-400' },
                    ].map(c => (
                      <div key={c.label} className="bg-slate-800/80 rounded-lg p-2.5 border border-white/5">
                        <div className="text-slate-500 text-[9px] mb-1 uppercase tracking-wide">{c.label}</div>
                        <div className="text-white text-sm font-bold leading-none">{c.value}</div>
                        <div className={`text-[9px] mt-0.5 ${c.color}`}>{c.unit}</div>
                      </div>
                    ))}
                  </div>

                  {/* Chart */}
                  <div className="bg-slate-800/60 rounded-lg p-3 border border-white/5" style={{height:'140px'}}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-slate-400 text-[10px] font-medium">Monthly Revenue 2025</span>
                      <span className="text-primary-400 text-[9px] font-semibold">+18% YoY</span>
                    </div>
                    <div className="flex items-end gap-1" style={{height:'90px'}}>
                      {[35, 48, 32, 58, 72, 55, 80, 68, 85, 72, 20, 0].map((h, i) => (
                        <div key={i} className="flex-1 flex flex-col justify-end">
                          <div
                            className={`rounded-sm ${h > 0 ? 'bg-gradient-to-t from-primary-600/90 to-primary-400/80' : 'bg-slate-700/40'}`}
                            style={{ height: `${Math.max(h, 4)}%` }}
                          />
                        </div>
                      ))}
                    </div>
                    <div className="flex justify-between mt-1">
                      {['J','F','M','A','M','J','J','A','S','O','N','D'].map(m => (
                        <span key={m} className="flex-1 text-center text-[8px] text-slate-600">{m}</span>
                      ))}
                    </div>
                  </div>

                  {/* Live badge */}
                  <div className="flex items-center gap-1.5 mt-2">
                    <Activity className="w-2.5 h-2.5 text-primary-400" />
                    <span className="text-[9px] text-primary-400">3 users active now · Invoice #003 being edited by Amina</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Trust logos */}
          <div className="mt-14 text-center">
            <p className="text-slate-600 text-xs font-semibold uppercase tracking-widest mb-6">Trusted by leading organisations</p>
            <div className="flex flex-wrap items-center justify-center gap-10">
              {['MTN Rwanda', 'BK Group', 'Equity Bank', 'Kigali City', 'RSSB', 'Inyange'].map(name => (
                <span key={name} className="text-slate-500 font-bold text-sm tracking-wide">{name}</span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ─── HOW IT WORKS ─────────────────────────────────────── */}
      <section id="how" className="py-24 bg-slate-50">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-16">
            <span className="inline-flex items-center gap-1.5 text-xs font-bold text-primary-600 uppercase tracking-widest bg-primary-50 border border-primary-100 rounded-full px-3 py-1 mb-4">
              How It Works
            </span>
            <h2 className="text-4xl font-extrabold text-ink mb-4 tracking-tight">
              Up and running in minutes
            </h2>
            <p className="text-ink-secondary text-lg max-w-xl mx-auto">
              No complex setup. No IT team. Just log in and start collaborating.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                step: '1', icon: Globe, bg: 'bg-primary-500',
                title: 'Create your workspace',
                desc: 'Register your organisation, invite your team, and assign roles — admin, accountant, warehouse manager, and more — in under 5 minutes.',
              },
              {
                step: '2', icon: Zap, bg: 'bg-blue-500',
                title: 'Collaborate in real-time',
                desc: 'See your colleagues\' cursors on the same invoice. Get live notifications when stock runs low or a payment is approved — instantly.',
              },
              {
                step: '3', icon: Brain, bg: 'bg-purple-500',
                title: 'Automate with AI',
                desc: 'Type "show all overdue invoices" or "create invoice for MTN for 5M RWF" — Claude parses and executes your command in one step.',
              },
            ].map(({ step, icon: Icon, bg, title, desc }) => (
              <div key={step} className="relative bg-white rounded-2xl p-7 border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-center gap-3 mb-5">
                  <div className={`w-10 h-10 ${bg} rounded-xl flex items-center justify-center shadow-sm`}>
                    <Icon className="w-5 h-5 text-white" />
                  </div>
                  <span className="text-3xl font-black text-slate-100 select-none">{step}</span>
                </div>
                <h3 className="text-lg font-bold text-ink mb-2">{title}</h3>
                <p className="text-ink-secondary text-sm leading-relaxed">{desc}</p>
                <div className="mt-5 flex items-center gap-1 text-primary-600 font-semibold text-sm">
                  Learn more <ChevronRight className="w-4 h-4" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── FEATURES ─────────────────────────────────────────── */}
      <section id="features" className="py-24 bg-white">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-16">
            <span className="inline-flex items-center gap-1.5 text-xs font-bold text-primary-600 uppercase tracking-widest bg-primary-50 border border-primary-100 rounded-full px-3 py-1 mb-4">
              Features
            </span>
            <h2 className="text-4xl font-extrabold text-ink mb-4 tracking-tight">
              Everything your business needs
            </h2>
            <p className="text-ink-secondary text-lg max-w-xl mx-auto">
              One platform, every module. No more switching between tools.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
            {[
              {
                icon: FileText, bg: 'bg-emerald-50', iconColor: 'text-emerald-600',
                title: 'Collaborative Invoicing',
                desc: 'Multiple accountants edit the same invoice live. Cursor presence, field-level sync, approval workflow — like Google Docs for billing.',
                tags: ['Real-time sync', 'Approval flow', 'Conflict-free'],
              },
              {
                icon: BarChart3, bg: 'bg-blue-50', iconColor: 'text-blue-600',
                title: 'Live Dashboards',
                desc: 'CEO, warehouse, and regional dashboards that update the instant data changes. Revenue charts, KPI cards, fleet maps — no refresh needed.',
                tags: ['Auto-refresh', 'Multi-role views', 'Revenue charts'],
              },
              {
                icon: Truck, bg: 'bg-amber-50', iconColor: 'text-amber-600',
                title: 'Fleet GPS Tracking',
                desc: 'Live vehicle positions via WebSocket. Dispatchers see all trucks move on the map in real-time. Fuel logging and trip history included.',
                tags: ['1Hz GPS', 'Fuel logs', 'Driver tracking'],
              },
              {
                icon: Users, bg: 'bg-purple-50', iconColor: 'text-purple-600',
                title: 'HR & Rwanda Payroll',
                desc: 'Employee management with automatic PAYE calculation using Rwanda\'s official 0–20–30% tax brackets. Pay slips generated with one click.',
                tags: ['Rwanda PAYE', 'Pay slips', 'Headcount'],
              },
              {
                icon: Brain, bg: 'bg-rose-50', iconColor: 'text-rose-600',
                title: 'AI Command Center',
                desc: 'Powered by Claude (Anthropic). Ask questions in plain English — "what\'s our inventory value?" — and get instant structured answers.',
                tags: ['Claude AI', '9 intents', 'Natural language'],
              },
              {
                icon: Shield, bg: 'bg-slate-50', iconColor: 'text-slate-600',
                title: 'Event Sourcing',
                desc: 'Every change is an immutable event. Full audit trail, time-travel debugging, and compliance-ready architecture out of the box.',
                tags: ['Append-only log', 'CQRS', 'Full audit trail'],
              },
            ].map(({ icon: Icon, bg, iconColor, title, desc, tags }) => (
              <div key={title} className="group rounded-2xl p-6 border border-slate-100 hover:border-primary-100 hover:shadow-md transition-all bg-white">
                <div className={`w-11 h-11 ${bg} rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                  <Icon className={`w-5 h-5 ${iconColor}`} />
                </div>
                <h3 className="text-base font-bold text-ink mb-2">{title}</h3>
                <p className="text-ink-secondary text-sm leading-relaxed mb-4">{desc}</p>
                <div className="flex flex-wrap gap-1.5">
                  {tags.map(t => (
                    <span key={t} className="text-[11px] font-medium text-ink-muted bg-slate-50 border border-slate-100 rounded-full px-2.5 py-0.5">{t}</span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── MODULES ──────────────────────────────────────────── */}
      <section id="modules" className="py-24 bg-slate-950">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            {/* Left */}
            <div>
              <span className="inline-flex items-center gap-1.5 text-xs font-bold text-primary-400 uppercase tracking-widest bg-primary-500/10 border border-primary-500/20 rounded-full px-3 py-1 mb-5">
                All-in-One Platform
              </span>
              <h2 className="text-4xl font-extrabold text-white mb-5 tracking-tight leading-tight">
                Every module,<br/>one unified system
              </h2>
              <p className="text-slate-400 text-lg mb-8 leading-relaxed">
                No more switching between six different tools. SyncFlow integrates everything
                into one real-time platform — built for how African businesses actually work.
              </p>

              <div className="grid grid-cols-2 gap-2">
                {[
                  { icon: FileText, label: 'Accounting & Invoicing' },
                  { icon: Package,  label: 'Inventory & Warehouses' },
                  { icon: Users,    label: 'HR & Rwanda Payroll' },
                  { icon: Globe,    label: 'CRM & Customers' },
                  { icon: Truck,    label: 'Fleet & GPS Tracking' },
                  { icon: Brain,    label: 'AI Natural Language' },
                  { icon: BarChart3,label: 'Live Dashboards' },
                  { icon: Lock,     label: 'Event Sourcing Audit' },
                ].map(({ icon: Icon, label }) => (
                  <div key={label} className="flex items-center gap-2.5 text-sm font-medium text-slate-300 bg-white/5 border border-white/8 rounded-xl px-3.5 py-2.5 hover:bg-white/8 transition-colors">
                    <Icon className="w-3.5 h-3.5 text-primary-400 shrink-0" />
                    {label}
                  </div>
                ))}
              </div>

              <Link href="/login" className="mt-8 inline-flex items-center gap-2 bg-primary-500 hover:bg-primary-600 text-white font-bold px-6 py-3 rounded-xl transition-colors shadow-lg shadow-primary-500/25">
                Start Free Trial
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            {/* Right — stat cards */}
            <div className="grid grid-cols-2 gap-4">
              {[
                { label: 'Total Revenue', value: '48.7M RWF', sub: '+18% this month', icon: TrendingUp, glow: 'shadow-primary-500/20' },
                { label: 'Active Vehicles', value: '8 / 12', sub: '3 on trip now', icon: Truck, glow: 'shadow-blue-500/20' },
                { label: 'Invoices Paid', value: '91%', sub: '62 of 68 approved', icon: FileText, glow: 'shadow-emerald-500/20' },
                { label: 'Team Members', value: '47 Staff', sub: '6 departments', icon: Users, glow: 'shadow-purple-500/20' },
              ].map(({ label, value, sub, icon: Icon, glow }) => (
                <div key={label} className={`bg-white/5 border border-white/10 rounded-2xl p-5 hover:bg-white/8 transition-colors shadow-lg ${glow}`}>
                  <div className="w-8 h-8 bg-primary-500/15 rounded-lg flex items-center justify-center mb-3">
                    <Icon className="w-4 h-4 text-primary-400" />
                  </div>
                  <div className="text-2xl font-extrabold text-white mb-0.5">{value}</div>
                  <div className="text-xs text-slate-500 mb-1">{label}</div>
                  <div className="text-xs text-primary-400 font-medium">{sub}</div>
                </div>
              ))}
              <div className="col-span-2 flex items-center gap-2 bg-primary-500/10 border border-primary-500/20 rounded-xl px-4 py-3">
                <span className="w-2 h-2 bg-primary-400 rounded-full animate-pulse shrink-0" />
                <span className="text-sm text-primary-300 font-medium">Invoice #003 being edited by Amina and Celestin — live</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── TESTIMONIALS ─────────────────────────────────────── */}
      <section className="py-24 bg-slate-50">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-14">
            <h2 className="text-4xl font-extrabold text-ink mb-3 tracking-tight">Loved across Africa</h2>
            <p className="text-ink-secondary text-lg">Real feedback from teams who moved their business to SyncFlow.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                name: 'Jean-Pierre Habimana', role: 'CFO, Kigali Trading Co.',
                avatar: 'JH',
                text: 'Before SyncFlow, finance sent Excel files over WhatsApp. Now three accountants edit invoices simultaneously and the CFO approves in one click. Total game changer.',
              },
              {
                name: 'Amina Uwimana', role: 'Operations Manager, BuildRW',
                avatar: 'AU',
                text: 'The live fleet map is incredible. I see all 20 trucks in real-time, get alerts when fuel is logged, and run utilization reports with a single click. Nothing comes close.',
              },
              {
                name: 'David Nkusi', role: 'CEO, AgriPro Rwanda',
                avatar: 'DN',
                text: 'I just type "what\'s our total overdue amount this month?" and get the answer instantly. No report to run, no waiting. The AI is genuinely useful, not a gimmick.',
              },
            ].map(({ name, role, avatar, text }) => (
              <div key={name} className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex gap-0.5 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                  ))}
                </div>
                <p className="text-ink-secondary text-sm leading-relaxed mb-6">"{text}"</p>
                <div className="flex items-center gap-3 pt-4 border-t border-slate-50">
                  <div className="w-9 h-9 bg-primary-100 rounded-full flex items-center justify-center text-primary-700 font-bold text-sm shrink-0">
                    {avatar}
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-ink">{name}</div>
                    <div className="text-xs text-ink-muted">{role}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── PRICING ──────────────────────────────────────────── */}
      <section id="pricing" className="py-24 bg-white">
        <div className="max-w-5xl mx-auto px-6">
          <div className="text-center mb-14">
            <span className="inline-flex items-center gap-1.5 text-xs font-bold text-primary-600 uppercase tracking-widest bg-primary-50 border border-primary-100 rounded-full px-3 py-1 mb-4">
              Pricing
            </span>
            <h2 className="text-4xl font-extrabold text-ink mb-3 tracking-tight">Simple, transparent pricing</h2>
            <p className="text-ink-secondary text-lg">Start free. Scale as you grow. No hidden fees.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                name: 'Starter', badge: null,
                price: 'Free', period: '',
                desc: 'For small teams just getting started.',
                features: ['Up to 5 users', '1 warehouse', 'Basic invoicing', '30-day history', 'Email support'],
                cta: 'Get Started Free', href: '/register', dark: false,
              },
              {
                name: 'Business', badge: 'Most Popular',
                price: '99,000', period: 'RWF/mo',
                desc: 'Full power for growing businesses.',
                features: ['Up to 50 users', 'Unlimited warehouses', 'Fleet GPS tracking', 'HR & Rwanda Payroll', 'AI commands (Claude)', 'Priority support'],
                cta: 'Start Free Trial', href: '/register', dark: true,
              },
              {
                name: 'Enterprise', badge: null,
                price: 'Custom', period: '',
                desc: 'For large organisations with custom needs.',
                features: ['Unlimited users', 'Custom modules', 'SLA guarantee', 'Dedicated CSM', 'On-premise option', 'Custom integrations'],
                cta: 'Contact Sales', href: '/login', dark: false,
              },
            ].map(({ name, badge, price, period, desc, features, cta, href, dark }) => (
              <div key={name} className={`relative rounded-2xl p-7 border transition-all hover:-translate-y-1 ${
                dark
                  ? 'bg-slate-950 border-primary-500/50 shadow-xl shadow-primary-500/10'
                  : 'bg-white border-slate-200 shadow-sm hover:shadow-md'
              }`}>
                {badge && (
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-primary-500 text-white text-[11px] font-bold px-4 py-1 rounded-full shadow-sm">
                    {badge}
                  </div>
                )}
                <div className={`text-xs font-bold uppercase tracking-widest mb-2 ${dark ? 'text-primary-400' : 'text-ink-muted'}`}>{name}</div>
                <div className="flex items-end gap-1.5 mb-1">
                  <span className={`text-4xl font-black ${dark ? 'text-white' : 'text-ink'}`}>{price}</span>
                  {period && <span className={`text-sm mb-1.5 ${dark ? 'text-slate-500' : 'text-ink-muted'}`}>{period}</span>}
                </div>
                <p className={`text-sm mb-6 ${dark ? 'text-slate-500' : 'text-ink-secondary'}`}>{desc}</p>
                <ul className="space-y-2.5 mb-7">
                  {features.map(f => (
                    <li key={f} className={`flex items-center gap-2.5 text-sm ${dark ? 'text-slate-300' : 'text-ink-secondary'}`}>
                      <CheckCircle2 className={`w-4 h-4 shrink-0 ${dark ? 'text-primary-400' : 'text-primary-500'}`} />
                      {f}
                    </li>
                  ))}
                </ul>
                <Link href={href} className={`flex items-center justify-center gap-2 w-full py-2.5 rounded-xl font-bold text-sm transition-all ${
                  dark
                    ? 'bg-primary-500 hover:bg-primary-600 text-white shadow-lg shadow-primary-500/25'
                    : 'bg-slate-100 hover:bg-slate-200 text-ink'
                }`}>
                  {cta}
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── CTA BANNER ───────────────────────────────────────── */}
      <section className="py-24 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10"
          style={{ backgroundImage: 'radial-gradient(circle, #22C55E 1px, transparent 1px)', backgroundSize: '32px 32px' }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[200px] bg-primary-500/8 blur-[80px] rounded-full" />

        <div className="relative max-w-2xl mx-auto px-6 text-center">
          <div className="w-14 h-14 bg-primary-500 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-xl shadow-primary-500/30">
            <Zap className="w-7 h-7 text-white" />
          </div>
          <h2 className="text-4xl font-extrabold text-white mb-4 tracking-tight">
            Ready to transform<br/>your operations?
          </h2>
          <p className="text-slate-400 text-lg mb-10 leading-relaxed">
            Join African businesses running on SyncFlow. Set up in minutes — no IT team required.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/register"
              className="flex items-center justify-center gap-2 bg-primary-500 hover:bg-primary-600 text-white font-bold text-base px-8 py-3.5 rounded-xl shadow-lg shadow-primary-500/30 transition-all">
              Start for Free
              <ArrowRight className="w-5 h-5" />
            </Link>
            <a href="mailto:hello@syncflow.rw"
              className="flex items-center justify-center gap-2 text-slate-300 font-semibold text-base px-8 py-3.5 rounded-xl border border-white/10 hover:bg-white/5 transition-all">
              Talk to Sales
            </a>
          </div>
        </div>
      </section>

      {/* ─── FOOTER ───────────────────────────────────────────── */}
      <footer className="bg-slate-950 border-t border-white/5 py-14">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid md:grid-cols-5 gap-8 mb-10">
            <div className="md:col-span-2">
              <div className="flex items-center gap-2.5 mb-4">
                <div className="w-7 h-7 bg-primary-500 rounded-lg flex items-center justify-center">
                  <Zap className="w-3.5 h-3.5 text-white" />
                </div>
                <span className="font-bold text-white">SyncFlow</span>
              </div>
              <p className="text-slate-500 text-sm leading-relaxed max-w-xs">
                Real-time multiplayer ERP for African businesses.
                Default currency: RWF. Timezone: Africa/Kigali.
              </p>
              <div className="mt-5 flex gap-3">
                {['Twitter', 'LinkedIn'].map(s => (
                  <a key={s} href="#" className="text-slate-600 hover:text-slate-400 text-xs transition-colors">{s}</a>
                ))}
              </div>
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
            <p className="text-slate-600 text-sm">Built with ❤️ for Africa · Kigali, Rwanda</p>
          </div>
        </div>
      </footer>

    </div>
  )
}
