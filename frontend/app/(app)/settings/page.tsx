'use client'

import { useState } from 'react'
import { useAuth } from '@/lib/auth-context'
import {
  User, Bell, Shield, Palette, Globe, LogOut,
  Save, Loader2, Check, Key, Plug, Copy, Eye, EyeOff,
  Plus, Trash2, RefreshCw, Smartphone, Monitor, Tablet,
  ChevronRight, Lock, Mail, Phone, Briefcase, Building2,
  Link2, FileText, AlertTriangle, Zap,
} from 'lucide-react'
import clsx from 'clsx'
import toast from 'react-hot-toast'

const SECTIONS = [
  { id: 'profile',       label: 'Profile',          icon: User,    desc: 'Personal info & photo' },
  { id: 'notifications', label: 'Notifications',     icon: Bell,    desc: 'Alerts & digests' },
  { id: 'security',      label: 'Security',          icon: Shield,  desc: 'Password & 2FA' },
  { id: 'appearance',    label: 'Appearance',        icon: Palette, desc: 'Theme & density' },
  { id: 'locale',        label: 'Language & Region', icon: Globe,   desc: 'Currency & timezone' },
  { id: 'integrations',  label: 'Integrations',      icon: Plug,    desc: 'Connected services' },
  { id: 'api_keys',      label: 'API Keys',          icon: Key,     desc: 'Programmatic access' },
]

function Toggle({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      type="button"
      aria-label={checked ? 'Disable' : 'Enable'}
      onClick={() => onChange(!checked)}
      className={clsx(
        'relative w-10 h-[22px] rounded-full transition-colors shrink-0',
        checked ? 'bg-orange-500' : 'bg-slate-200'
      )}
    >
      <span className={clsx(
        'absolute top-[3px] w-4 h-4 bg-white rounded-full shadow-sm transition-transform',
        checked ? 'translate-x-[21px]' : 'translate-x-[3px]'
      )} />
    </button>
  )
}

const MOCK_API_KEYS = [
  { id: '1', name: 'Production key',    prefix: 'sf_live_xxx…', created: '2025-04-01', last_used: '2 hr ago',  scope: 'Read / Write' },
  { id: '2', name: 'Reporting service', prefix: 'sf_live_yyy…', created: '2025-03-15', last_used: '1 day ago', scope: 'Read only' },
]

const INTEGRATIONS = [
  { id: 'slack',  name: 'Slack',        desc: 'Post alerts and approvals to your Slack workspace.',   logo: '💬', connected: true,  badge: '#syncflow-alerts', color: 'bg-purple-50' },
  { id: 'gmail',  name: 'Gmail',        desc: 'Send invoice PDFs and payslips via your Gmail.',       logo: '📧', connected: false, badge: null,               color: 'bg-red-50' },
  { id: 'gdrive', name: 'Google Drive', desc: 'Auto-export monthly reports to a Drive folder.',       logo: '📁', connected: false, badge: null,               color: 'bg-blue-50' },
  { id: 'mpesa',  name: 'MTN MoMo',     desc: 'Reconcile mobile money payments automatically.',       logo: '📱', connected: true,  badge: 'MTN Business',     color: 'bg-yellow-50' },
  { id: 'bk',     name: 'BK API',       desc: 'Sync Bank of Kigali transactions to ledger.',         logo: '🏦', connected: false, badge: null,               color: 'bg-emerald-50' },
]

export default function SettingsPage() {
  const { user, logout } = useAuth() as { user: { name?: string; email?: string; role?: string } | null; logout: () => void }
  const [section, setSection] = useState('profile')
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  const [profile, setProfile] = useState({
    name:       user?.name ?? '',
    email:      user?.email ?? '',
    bio:        '',
    phone:      '',
    job_title:  '',
    department: '',
    linkedin:   '',
  })

  const [notifications, setNotifications] = useState({
    invoice_approved: true,
    invoice_rejected: true,
    low_stock:        true,
    payroll_ready:    true,
    fleet_alert:      false,
    email_digest:     true,
    sound:            false,
    browser_push:     true,
    weekly_summary:   false,
  })

  const [security, setSecurity] = useState({
    two_factor:      false,
    session_timeout: '8h',
    login_alerts:    true,
  })

  const [appearance, setAppearance] = useState({
    theme:            'light',
    density:          'comfortable',
    reduced_motion:   false,
  })

  const [locale, setLocale] = useState({
    language:    'en',
    currency:    'RWF',
    timezone:    'Africa/Kigali',
    date_format: 'DD/MM/YYYY',
  })

  const [showKey, setShowKey]     = useState<Record<string, boolean>>({})
  const [newKeyName, setNewKeyName] = useState('')
  const [integrations, setIntegrations] = useState(
    Object.fromEntries(INTEGRATIONS.map(i => [i.id, i.connected]))
  )

  const handleSave = async () => {
    setSaving(true)
    await new Promise(r => setTimeout(r, 700))
    setSaving(false)
    setSaved(true)
    toast.success('Settings saved')
    setTimeout(() => setSaved(false), 2000)
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    toast.success('Copied to clipboard')
  }

  const currentSection = SECTIONS.find(s => s.id === section)

  return (
    <div className="flex flex-col h-full overflow-hidden bg-slate-50">

      {/* ── Page header banner ───────────────────── */}
      <div className="bg-white border-b border-slate-100 px-6 py-4 shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-orange-50 rounded-xl flex items-center justify-center">
              {currentSection && <currentSection.icon className="w-4.5 h-4.5 text-orange-500" />}
            </div>
            <div>
              <h1 className="text-base font-bold text-slate-900">{currentSection?.label ?? 'Settings'}</h1>
              <p className="text-xs text-slate-500">{currentSection?.desc}</p>
            </div>
          </div>
          {!['api_keys', 'integrations'].includes(section) && (
            <button
              type="button"
              onClick={handleSave}
              disabled={saving}
              className={clsx(
                'flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all',
                saved
                  ? 'bg-emerald-500 text-white'
                  : 'bg-orange-500 hover:bg-orange-400 text-white shadow-sm shadow-orange-500/30 active:scale-95'
              )}
            >
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : saved ? <Check className="w-4 h-4" /> : <Save className="w-4 h-4" />}
              {saving ? 'Saving…' : saved ? 'Saved!' : 'Save Changes'}
            </button>
          )}
        </div>
      </div>

      <div className="flex-1 overflow-hidden flex min-h-0">

        {/* ── Left nav ─────────────────────────────── */}
        <aside className="w-56 bg-white border-r border-slate-100 py-3 shrink-0 overflow-y-auto flex flex-col">
          <nav className="flex-1 px-2 space-y-0.5">
            {SECTIONS.map(({ id, label, icon: Icon, desc }) => (
              <button
                key={id}
                type="button"
                onClick={() => setSection(id)}
                className={clsx(
                  'w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-all group',
                  section === id
                    ? 'bg-orange-50 text-orange-600'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                )}
              >
                <div className={clsx(
                  'w-7 h-7 rounded-lg flex items-center justify-center shrink-0 transition-colors',
                  section === id ? 'bg-orange-100' : 'bg-slate-100 group-hover:bg-slate-200'
                )}>
                  <Icon className={clsx('w-3.5 h-3.5', section === id ? 'text-orange-500' : 'text-slate-500')} />
                </div>
                <div className="min-w-0">
                  <div className={clsx('text-sm font-medium truncate', section === id ? 'text-orange-700' : '')}>{label}</div>
                  <div className="text-[10px] text-slate-400 truncate">{desc}</div>
                </div>
                {section === id && <ChevronRight className="w-3.5 h-3.5 text-orange-400 ml-auto shrink-0" />}
              </button>
            ))}
          </nav>

          <div className="px-2 pb-3 pt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={logout}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-red-600 hover:bg-red-50 transition-colors font-medium"
            >
              <div className="w-7 h-7 bg-red-50 rounded-lg flex items-center justify-center shrink-0">
                <LogOut className="w-3.5 h-3.5 text-red-500" />
              </div>
              Sign out
            </button>
          </div>
        </aside>

        {/* ── Main content ─────────────────────────── */}
        <div className="flex-1 overflow-y-auto">
          <div className="max-w-2xl mx-auto p-6 space-y-6">

            {/* ── Profile ─────────────────────────────── */}
            {section === 'profile' && (
              <>
                {/* Avatar card */}
                <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                  <div className="h-20 bg-gradient-to-r from-orange-400 to-amber-400" />
                  <div className="px-6 pb-5">
                    <div className="flex items-end justify-between -mt-8 mb-4">
                      <div className="w-16 h-16 bg-orange-500 rounded-2xl border-4 border-white flex items-center justify-center text-white font-bold text-xl shadow-md">
                        {profile.name?.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() || 'U'}
                      </div>
                      <button type="button" className="text-xs text-orange-600 hover:text-orange-700 font-semibold bg-orange-50 px-3 py-1.5 rounded-lg transition-colors">
                        Change photo
                      </button>
                    </div>
                    <div className="font-bold text-slate-900 text-lg">{profile.name || 'Your Name'}</div>
                    <div className="text-sm text-slate-500 capitalize">{user?.role?.replace(/_/g, ' ') ?? 'User'}</div>
                  </div>
                </div>

                {/* Form fields */}
                <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 space-y-4">
                  <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                    <User className="w-4 h-4 text-orange-500" />Personal Information
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="col-span-2">
                      <label htmlFor="s-name" className="block text-xs font-medium text-slate-600 mb-1.5">Full Name</label>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input id="s-name" className="input pl-9" value={profile.name} onChange={e => setProfile(f => ({ ...f, name: e.target.value }))} placeholder="John Doe" />
                      </div>
                    </div>
                    <div className="col-span-2">
                      <label htmlFor="s-email" className="block text-xs font-medium text-slate-600 mb-1.5">Email Address</label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input id="s-email" className="input pl-9" type="email" value={profile.email} onChange={e => setProfile(f => ({ ...f, email: e.target.value }))} placeholder="john@company.com" />
                      </div>
                    </div>
                    <div>
                      <label htmlFor="s-phone" className="block text-xs font-medium text-slate-600 mb-1.5">Phone</label>
                      <div className="relative">
                        <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input id="s-phone" className="input pl-9" value={profile.phone} onChange={e => setProfile(f => ({ ...f, phone: e.target.value }))} placeholder="+250 788 000 000" />
                      </div>
                    </div>
                    <div>
                      <label htmlFor="s-title" className="block text-xs font-medium text-slate-600 mb-1.5">Job Title</label>
                      <div className="relative">
                        <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input id="s-title" className="input pl-9" value={profile.job_title} onChange={e => setProfile(f => ({ ...f, job_title: e.target.value }))} placeholder="Finance Manager" />
                      </div>
                    </div>
                    <div>
                      <label htmlFor="s-dept" className="block text-xs font-medium text-slate-600 mb-1.5">Department</label>
                      <div className="relative">
                        <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <select id="s-dept" className="input pl-9" value={profile.department} onChange={e => setProfile(f => ({ ...f, department: e.target.value }))}>
                          <option value="">Select department</option>
                          {['Finance', 'Operations', 'HR', 'Sales & CRM', 'Logistics', 'IT', 'Executive'].map(d => (
                            <option key={d} value={d}>{d}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                    <div>
                      <label htmlFor="s-linkedin" className="block text-xs font-medium text-slate-600 mb-1.5">LinkedIn</label>
                      <div className="relative">
                        <Link2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input id="s-linkedin" className="input pl-9" value={profile.linkedin} onChange={e => setProfile(f => ({ ...f, linkedin: e.target.value }))} placeholder="linkedin.com/in/username" />
                      </div>
                    </div>
                    <div className="col-span-2">
                      <label htmlFor="s-bio" className="block text-xs font-medium text-slate-600 mb-1.5">Bio</label>
                      <textarea id="s-bio" className="input" rows={3} value={profile.bio} onChange={e => setProfile(f => ({ ...f, bio: e.target.value }))} placeholder="Tell your team a bit about yourself…" />
                    </div>
                  </div>
                </div>
              </>
            )}

            {/* ── Notifications ───────────────────────── */}
            {section === 'notifications' && (
              <>
                <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                  <div className="px-6 py-4 border-b border-slate-100 flex items-center gap-2">
                    <Bell className="w-4 h-4 text-orange-500" />
                    <div>
                      <h3 className="text-sm font-bold text-slate-900">Activity Alerts</h3>
                      <p className="text-xs text-slate-500">Get notified on key business events</p>
                    </div>
                  </div>
                  {[
                    { key: 'invoice_approved', label: 'Invoice Approved',    desc: 'When an invoice you created is approved', icon: Check },
                    { key: 'invoice_rejected', label: 'Invoice Rejected',    desc: 'When an invoice is rejected by an approver', icon: AlertTriangle },
                    { key: 'low_stock',        label: 'Low Stock Alerts',    desc: 'When inventory drops below reorder point', icon: AlertTriangle },
                    { key: 'payroll_ready',    label: 'Payroll Ready',       desc: 'When a payroll run is awaiting approval', icon: Check },
                    { key: 'fleet_alert',      label: 'Fleet Alerts',        desc: 'Vehicle maintenance reminders and GPS alerts', icon: Zap },
                  ].map(({ key, label, desc, icon: Icon }) => (
                    <div key={key} className="flex items-center justify-between px-6 py-4 border-b border-slate-50 last:border-0">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-orange-50 rounded-lg flex items-center justify-center shrink-0">
                          <Icon className="w-4 h-4 text-orange-400" />
                        </div>
                        <div>
                          <div className="text-sm font-medium text-slate-800">{label}</div>
                          <div className="text-xs text-slate-500">{desc}</div>
                        </div>
                      </div>
                      <Toggle checked={notifications[key as keyof typeof notifications]} onChange={v => setNotifications(n => ({ ...n, [key]: v }))} />
                    </div>
                  ))}
                </div>

                <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                  <div className="px-6 py-4 border-b border-slate-100 flex items-center gap-2">
                    <Mail className="w-4 h-4 text-orange-500" />
                    <div>
                      <h3 className="text-sm font-bold text-slate-900">Delivery Preferences</h3>
                      <p className="text-xs text-slate-500">How and when you receive notifications</p>
                    </div>
                  </div>
                  {[
                    { key: 'browser_push',   label: 'Browser Push',      desc: 'Real-time push notifications in your browser' },
                    { key: 'email_digest',   label: 'Daily Email Digest', desc: 'Summary of key metrics delivered each morning' },
                    { key: 'weekly_summary', label: 'Weekly Summary',     desc: 'A weekly report on business performance' },
                    { key: 'sound',          label: 'Notification Sound', desc: 'Play a chime when a new notification arrives' },
                  ].map(({ key, label, desc }) => (
                    <div key={key} className="flex items-center justify-between px-6 py-4 border-b border-slate-50 last:border-0">
                      <div>
                        <div className="text-sm font-medium text-slate-800">{label}</div>
                        <div className="text-xs text-slate-500">{desc}</div>
                      </div>
                      <Toggle checked={notifications[key as keyof typeof notifications]} onChange={v => setNotifications(n => ({ ...n, [key]: v }))} />
                    </div>
                  ))}
                </div>
              </>
            )}

            {/* ── Security ────────────────────────────── */}
            {section === 'security' && (
              <>
                <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 space-y-4">
                  <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                    <Lock className="w-4 h-4 text-orange-500" />Change Password
                  </h3>
                  <div>
                    <label htmlFor="current-pw" className="block text-xs font-medium text-slate-600 mb-1.5">Current Password</label>
                    <input id="current-pw" className="input" type="password" placeholder="••••••••" />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label htmlFor="new-pw" className="block text-xs font-medium text-slate-600 mb-1.5">New Password</label>
                      <input id="new-pw" className="input" type="password" placeholder="Min 8 characters" />
                    </div>
                    <div>
                      <label htmlFor="confirm-pw" className="block text-xs font-medium text-slate-600 mb-1.5">Confirm Password</label>
                      <input id="confirm-pw" className="input" type="password" placeholder="••••••••" />
                    </div>
                  </div>
                  <button type="button" className="flex items-center gap-2 px-4 py-2 bg-orange-500 hover:bg-orange-400 text-white text-sm font-semibold rounded-xl transition-colors">
                    <Lock className="w-4 h-4" />Update Password
                  </button>
                </div>

                <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                  <div className="px-6 py-4 border-b border-slate-100">
                    <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                      <Shield className="w-4 h-4 text-orange-500" />Two-Factor Authentication
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5">Add a second layer of protection to your account</p>
                  </div>
                  <div className="px-6 py-4 flex items-center justify-between border-b border-slate-50">
                    <div>
                      <div className="text-sm font-medium text-slate-800">Authenticator App (TOTP)</div>
                      <div className="text-xs text-slate-500">Google Authenticator, Authy, etc.</div>
                    </div>
                    <Toggle checked={security.two_factor} onChange={v => setSecurity(s => ({ ...s, two_factor: v }))} />
                  </div>
                  <div className="px-6 py-4 flex items-center justify-between">
                    <div>
                      <div className="text-sm font-medium text-slate-800">Login Alerts via Email</div>
                      <div className="text-xs text-slate-500">Get notified of new sign-ins to your account</div>
                    </div>
                    <Toggle checked={security.login_alerts} onChange={v => setSecurity(s => ({ ...s, login_alerts: v }))} />
                  </div>
                </div>

                <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
                  <h3 className="text-sm font-bold text-slate-900 mb-1">Session Timeout</h3>
                  <p className="text-xs text-slate-500 mb-4">Auto sign-out after a period of inactivity</p>
                  <div className="grid grid-cols-4 gap-2">
                    {['1h', '4h', '8h', '24h'].map(t => (
                      <button
                        key={t}
                        type="button"
                        onClick={() => setSecurity(s => ({ ...s, session_timeout: t }))}
                        className={clsx(
                          'py-2.5 rounded-xl border text-sm font-semibold transition-all',
                          security.session_timeout === t
                            ? 'border-orange-500 bg-orange-50 text-orange-700 shadow-sm'
                            : 'border-slate-200 text-slate-500 hover:border-slate-300 hover:bg-slate-50'
                        )}
                      >
                        {t}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
                  <h3 className="text-sm font-bold text-slate-900 mb-1">Active Sessions</h3>
                  <p className="text-xs text-slate-500 mb-4">Devices currently signed in to your account</p>
                  <div className="space-y-3">
                    {[
                      { device: 'Chrome · Windows 11', location: 'Kigali, Rwanda', icon: Monitor,    active: true },
                      { device: 'Safari · iPhone 15',  location: 'Kigali, Rwanda', icon: Smartphone, active: false },
                      { device: 'Chrome · iPad Pro',   location: 'Huye, Rwanda',   icon: Tablet,     active: false },
                    ].map(({ device, location, icon: Icon, active }) => (
                      <div key={device} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 bg-white rounded-xl border border-slate-200 flex items-center justify-center shadow-sm">
                            <Icon className="w-4 h-4 text-slate-500" />
                          </div>
                          <div>
                            <div className="text-sm font-medium text-slate-800">{device}</div>
                            <div className="text-xs text-slate-500">{location}</div>
                          </div>
                        </div>
                        {active
                          ? <span className="text-xs font-semibold bg-emerald-100 text-emerald-700 px-2.5 py-1 rounded-full">Current</span>
                          : <button type="button" className="text-xs text-red-600 hover:text-red-700 font-semibold hover:bg-red-50 px-2.5 py-1 rounded-lg transition-colors">Revoke</button>
                        }
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}

            {/* ── Appearance ──────────────────────────── */}
            {section === 'appearance' && (
              <>
                <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 space-y-6">
                  <div>
                    <label className="block text-sm font-bold text-slate-900 mb-3">Theme</label>
                    <div className="grid grid-cols-3 gap-3">
                      {[
                        { value: 'light',  label: 'Light',  preview: '☀️', bg: 'bg-white border-slate-200' },
                        { value: 'dark',   label: 'Dark',   preview: '🌙', bg: 'bg-slate-800 border-slate-700' },
                        { value: 'system', label: 'System', preview: '💻', bg: 'bg-gradient-to-br from-white to-slate-200 border-slate-200' },
                      ].map(({ value, label, preview, bg }) => (
                        <button
                          key={value}
                          type="button"
                          onClick={() => setAppearance(a => ({ ...a, theme: value }))}
                          className={clsx(
                            'flex flex-col items-center gap-2 p-4 rounded-2xl border-2 transition-all',
                            appearance.theme === value
                              ? 'border-orange-500 shadow-md shadow-orange-100'
                              : 'border-slate-200 hover:border-slate-300'
                          )}
                        >
                          <div className={clsx('w-full h-10 rounded-xl border', bg, 'flex items-center justify-center text-xl')}>
                            {preview}
                          </div>
                          <span className={clsx('text-sm font-semibold', appearance.theme === value ? 'text-orange-600' : 'text-slate-600')}>{label}</span>
                          {appearance.theme === value && <div className="w-1.5 h-1.5 rounded-full bg-orange-500" />}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="border-t border-slate-100 pt-5">
                    <label className="block text-sm font-bold text-slate-900 mb-3">Display Density</label>
                    <div className="grid grid-cols-3 gap-3">
                      {[
                        { value: 'compact',     label: 'Compact',     icon: '▤' },
                        { value: 'comfortable', label: 'Comfortable', icon: '▣' },
                        { value: 'spacious',    label: 'Spacious',    icon: '□' },
                      ].map(({ value, label, icon }) => (
                        <button
                          key={value}
                          type="button"
                          onClick={() => setAppearance(a => ({ ...a, density: value }))}
                          className={clsx(
                            'flex items-center gap-2.5 px-4 py-3 rounded-xl border-2 text-sm font-medium transition-all',
                            appearance.density === value
                              ? 'border-orange-500 bg-orange-50 text-orange-700'
                              : 'border-slate-200 text-slate-600 hover:border-slate-300 hover:bg-slate-50'
                          )}
                        >
                          <span className="text-lg leading-none">{icon}</span>
                          {label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="border-t border-slate-100 pt-5 flex items-center justify-between">
                    <div>
                      <div className="text-sm font-semibold text-slate-800">Reduce Motion</div>
                      <div className="text-xs text-slate-500">Disable animations and transitions throughout the app</div>
                    </div>
                    <Toggle checked={appearance.reduced_motion} onChange={v => setAppearance(a => ({ ...a, reduced_motion: v }))} />
                  </div>
                </div>
              </>
            )}

            {/* ── Language & Region ───────────────────── */}
            {section === 'locale' && (
              <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 space-y-5">
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <Globe className="w-4 h-4 text-orange-500" />Regional Settings
                </h3>
                {[
                  { key: 'language',    label: 'Language',         options: [{ value: 'en', label: 'English' }, { value: 'fr', label: 'Français' }, { value: 'rw', label: 'Kinyarwanda' }] },
                  { key: 'currency',    label: 'Default Currency',  options: [{ value: 'RWF', label: 'Rwandan Franc (RWF)' }, { value: 'USD', label: 'US Dollar (USD)' }, { value: 'EUR', label: 'Euro (EUR)' }, { value: 'KES', label: 'Kenyan Shilling (KES)' }] },
                  { key: 'timezone',    label: 'Timezone',          options: [{ value: 'Africa/Kigali', label: 'Africa/Kigali (UTC+2)' }, { value: 'Africa/Nairobi', label: 'Africa/Nairobi (UTC+3)' }, { value: 'UTC', label: 'UTC' }, { value: 'Europe/London', label: 'Europe/London' }] },
                  { key: 'date_format', label: 'Date Format',       options: [{ value: 'DD/MM/YYYY', label: 'DD/MM/YYYY' }, { value: 'MM/DD/YYYY', label: 'MM/DD/YYYY' }, { value: 'YYYY-MM-DD', label: 'YYYY-MM-DD (ISO)' }] },
                ].map(({ key, label, options }) => (
                  <div key={key}>
                    <label htmlFor={`locale-${key}`} className="block text-xs font-semibold text-slate-600 mb-1.5">{label}</label>
                    <select id={`locale-${key}`} className="input" value={locale[key as keyof typeof locale]} onChange={e => setLocale(l => ({ ...l, [key]: e.target.value }))}>
                      {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                    </select>
                  </div>
                ))}
              </div>
            )}

            {/* ── Integrations ────────────────────────── */}
            {section === 'integrations' && (
              <div className="space-y-3">
                <p className="text-xs text-slate-500 font-medium uppercase tracking-wider px-1">5 integrations available</p>
                {INTEGRATIONS.map(({ id, name, desc, logo, badge, color }) => {
                  const isConnected = integrations[id]
                  return (
                    <div key={id} className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 flex items-center gap-4 hover:border-slate-200 transition-colors">
                      <div className={clsx('w-12 h-12 rounded-2xl flex items-center justify-center text-2xl shrink-0', color)}>
                        {logo}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-0.5">
                          <span className="text-sm font-bold text-slate-900">{name}</span>
                          {isConnected && badge && (
                            <span className="text-[10px] font-semibold bg-orange-50 text-orange-600 border border-orange-100 rounded-full px-2 py-0.5">{badge}</span>
                          )}
                          {isConnected && (
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block" />
                          )}
                        </div>
                        <p className="text-xs text-slate-500 leading-relaxed">{desc}</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          setIntegrations(prev => ({ ...prev, [id]: !prev[id] }))
                          toast.success(isConnected ? `${name} disconnected` : `${name} connected`)
                        }}
                        className={clsx(
                          'shrink-0 text-xs font-bold px-4 py-2 rounded-xl transition-colors',
                          isConnected
                            ? 'bg-red-50 text-red-600 hover:bg-red-100'
                            : 'bg-orange-50 text-orange-700 hover:bg-orange-100'
                        )}
                      >
                        {isConnected ? 'Disconnect' : 'Connect'}
                      </button>
                    </div>
                  )
                })}
              </div>
            )}

            {/* ── API Keys ────────────────────────────── */}
            {section === 'api_keys' && (
              <>
                <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-start gap-3">
                  <AlertTriangle className="w-4 h-4 text-amber-600 mt-0.5 shrink-0" />
                  <p className="text-xs text-amber-800 leading-relaxed">
                    <strong>Keep your keys secret.</strong> Never share them in code, emails, or client-side apps. Rotate keys immediately if you suspect a compromise.
                  </p>
                </div>

                <div className="space-y-3">
                  {MOCK_API_KEYS.map(k => (
                    <div key={k.id} className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
                      <div className="flex items-start justify-between gap-3 mb-4">
                        <div>
                          <div className="flex items-center gap-2 mb-0.5">
                            <FileText className="w-4 h-4 text-orange-500" />
                            <span className="text-sm font-bold text-slate-900">{k.name}</span>
                          </div>
                          <div className="text-xs text-slate-500">{k.scope} · Created {k.created} · Last used {k.last_used}</div>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <button
                            type="button"
                            title="Rotate key"
                            onClick={() => toast.success('Key rotated — update your services')}
                            className="w-8 h-8 flex items-center justify-center rounded-xl bg-slate-100 hover:bg-orange-50 text-slate-500 hover:text-orange-500 transition-colors"
                          >
                            <RefreshCw className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            title="Delete key"
                            onClick={() => toast.success('API key deleted')}
                            className="w-8 h-8 flex items-center justify-center rounded-xl bg-slate-100 hover:bg-red-50 text-slate-500 hover:text-red-500 transition-colors"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5">
                        <code className="flex-1 text-xs font-mono text-slate-600 select-all">
                          {showKey[k.id] ? 'sf_live_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx' : k.prefix}
                        </code>
                        <button
                          type="button"
                          onClick={() => setShowKey(s => ({ ...s, [k.id]: !s[k.id] }))}
                          aria-label={showKey[k.id] ? 'Hide key' : 'Show key'}
                          className="text-slate-400 hover:text-slate-600 transition-colors"
                        >
                          {showKey[k.id] ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                        </button>
                        <button
                          type="button"
                          aria-label="Copy key"
                          onClick={() => copyToClipboard('sf_live_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx')}
                          className="text-slate-400 hover:text-orange-500 transition-colors"
                        >
                          <Copy className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
                  <h3 className="text-sm font-bold text-slate-900 mb-3 flex items-center gap-2">
                    <Plus className="w-4 h-4 text-orange-500" />Generate New Key
                  </h3>
                  <div className="flex gap-2">
                    <input
                      className="input flex-1"
                      placeholder="Key name (e.g. Reporting service)"
                      value={newKeyName}
                      onChange={e => setNewKeyName(e.target.value)}
                    />
                    <button
                      type="button"
                      onClick={() => {
                        if (newKeyName.trim()) {
                          toast.success(`Key "${newKeyName}" created`)
                          setNewKeyName('')
                        }
                      }}
                      className="flex items-center gap-1.5 px-4 py-2 bg-orange-500 hover:bg-orange-400 text-white text-sm font-bold rounded-xl transition-colors shrink-0"
                    >
                      <Plus className="w-4 h-4" />Generate
                    </button>
                  </div>
                </div>
              </>
            )}

          </div>
        </div>
      </div>
    </div>
  )
}
