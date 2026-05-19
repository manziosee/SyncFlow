'use client'

import { useState } from 'react'
import { useAuth } from '@/lib/auth-context'
import PageHeroHeader from '@/components/dashboard/PageHeroHeader'
import {
  User, Bell, Shield, Palette, Globe, LogOut,
  Save, Loader2, Check, Key, Plug, Copy, Eye, EyeOff,
  Plus, Trash2, RefreshCw, Smartphone, Monitor, Tablet,
} from 'lucide-react'
import clsx from 'clsx'
import toast from 'react-hot-toast'

const SECTIONS = [
  { id: 'profile',       label: 'Profile',          icon: User },
  { id: 'notifications', label: 'Notifications',     icon: Bell },
  { id: 'security',      label: 'Security',          icon: Shield },
  { id: 'appearance',    label: 'Appearance',        icon: Palette },
  { id: 'locale',        label: 'Language & Region', icon: Globe },
  { id: 'integrations',  label: 'Integrations',      icon: Plug },
  { id: 'api_keys',      label: 'API Keys',          icon: Key },
]

function Toggle({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      type="button"
      aria-label={checked ? 'Disable' : 'Enable'}
      onClick={() => onChange(!checked)}
      className={clsx('relative w-10 h-[22px] rounded-full transition-colors shrink-0', checked ? 'bg-primary-500' : 'bg-slate-200')}
    >
      <span className={clsx(
        'absolute top-[3px] w-4 h-4 bg-white rounded-full shadow-sm transition-transform',
        checked ? 'translate-x-[21px]' : 'translate-x-[3px]'
      )} />
    </button>
  )
}

const MOCK_API_KEYS = [
  { id: '1', name: 'Production key', prefix: 'sf_live_xxx…', created: '2025-04-01', last_used: '2 hr ago', scope: 'Read / Write' },
  { id: '2', name: 'Reporting service', prefix: 'sf_live_yyy…', created: '2025-03-15', last_used: '1 day ago', scope: 'Read only' },
]

const INTEGRATIONS = [
  { id: 'slack',   name: 'Slack',    desc: 'Post alerts and approvals to your Slack workspace.',    logo: '💬', connected: true,  badge: '#syncflow-alerts' },
  { id: 'gmail',   name: 'Gmail',    desc: 'Send invoice PDFs and payslips via your Gmail account.',logo: '📧', connected: false, badge: null },
  { id: 'gdrive',  name: 'Google Drive', desc: 'Auto-export monthly reports to a Drive folder.',   logo: '📁', connected: false, badge: null },
  { id: 'mpesa',   name: 'MTN MoMo', desc: 'Reconcile mobile money payments automatically.',        logo: '📱', connected: true,  badge: 'MTN Business' },
  { id: 'bk',      name: 'BK API',   desc: 'Sync Bank of Kigali transactions to ledger entries.',  logo: '🏦', connected: false, badge: null },
]

export default function SettingsPage() {
  const { user, logout } = useAuth() as { user: { name?: string; email?: string; role?: string } | null; logout: () => void }
  const [section, setSection] = useState('profile')
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  const [profile, setProfile] = useState({
    name: user?.name ?? '',
    email: user?.email ?? '',
    bio: '',
    phone: '',
    job_title: '',
    department: '',
    linkedin: '',
  })

  const [notifications, setNotifications] = useState({
    invoice_approved: true,
    invoice_rejected: true,
    low_stock: true,
    payroll_ready: true,
    fleet_alert: false,
    email_digest: true,
    sound: false,
    browser_push: true,
    weekly_summary: false,
  })

  const [security, setSecurity] = useState({
    two_factor: false,
    session_timeout: '8h',
    login_alerts: true,
  })

  const [appearance, setAppearance] = useState({
    theme: 'light',
    density: 'comfortable',
    sidebar_collapsed: false,
    reduced_motion: false,
  })

  const [locale, setLocale] = useState({
    language: 'en',
    currency: 'RWF',
    timezone: 'Africa/Kigali',
    date_format: 'DD/MM/YYYY',
  })

  const [showKey, setShowKey] = useState<Record<string, boolean>>({})
  const [newKeyName, setNewKeyName] = useState('')

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

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <PageHeroHeader
        title="Settings"
        highlight="Settings"
        subtitle="Account preferences, security & integrations"
        imageIndex={3}
      />

      <div className="flex-1 overflow-hidden flex">
        {/* Sidebar nav */}
        <aside className="w-52 border-r border-slate-100 py-4 shrink-0 overflow-y-auto flex flex-col">
          <div className="flex-1">
            {SECTIONS.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                type="button"
                onClick={() => setSection(id)}
                className={clsx(
                  'w-full flex items-center gap-3 px-4 py-2.5 text-sm font-medium transition-all text-left',
                  section === id
                    ? 'text-primary-600 bg-primary-50 border-r-2 border-primary-500'
                    : 'text-ink-muted hover:text-ink hover:bg-slate-50'
                )}
              >
                <Icon className="w-4 h-4 shrink-0" />
                {label}
              </button>
            ))}
          </div>

          <div className="px-4 pb-2 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={logout}
              className="w-full flex items-center gap-2 text-sm text-danger hover:bg-red-50 px-3 py-2 rounded-lg transition-colors font-medium"
            >
              <LogOut className="w-4 h-4" />Sign out
            </button>
          </div>
        </aside>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 lg:p-8">
          {/* ── Profile ────────────────────────────────────── */}
          {section === 'profile' && (
            <div className="max-w-lg mx-auto space-y-6">
              <div>
                <h2 className="text-lg font-bold text-ink">Profile</h2>
                <p className="text-sm text-ink-muted">Update your personal information visible to your team</p>
              </div>

              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center text-primary-700 font-bold text-2xl shrink-0">
                  {profile.name?.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() || 'U'}
                </div>
                <div>
                  <div className="font-semibold text-ink">{profile.name || 'User'}</div>
                  <div className="text-xs text-ink-muted capitalize">{user?.role?.replace(/_/g, ' ')}</div>
                  <button type="button" className="text-xs text-primary-600 hover:text-primary-700 mt-1 font-medium">Change photo</button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="col-span-2">
                  <label className="block text-xs font-medium text-ink-secondary mb-1">Full Name</label>
                  <input className="input" value={profile.name} onChange={e => setProfile(f => ({ ...f, name: e.target.value }))} />
                </div>
                <div className="col-span-2">
                  <label className="block text-xs font-medium text-ink-secondary mb-1">Email Address</label>
                  <input className="input" type="email" value={profile.email} onChange={e => setProfile(f => ({ ...f, email: e.target.value }))} />
                </div>
                <div>
                  <label className="block text-xs font-medium text-ink-secondary mb-1">Phone</label>
                  <input className="input" value={profile.phone} onChange={e => setProfile(f => ({ ...f, phone: e.target.value }))} placeholder="+250 788 000 000" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-ink-secondary mb-1">Job Title</label>
                  <input className="input" value={profile.job_title} onChange={e => setProfile(f => ({ ...f, job_title: e.target.value }))} placeholder="e.g. Finance Manager" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-ink-secondary mb-1">Department</label>
                  <select aria-label="Department" className="input" value={profile.department} onChange={e => setProfile(f => ({ ...f, department: e.target.value }))}>
                    <option value="">Select department</option>
                    {['Finance', 'Operations', 'HR', 'Sales & CRM', 'Logistics', 'IT', 'Executive'].map(d => (
                      <option key={d} value={d}>{d}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-ink-secondary mb-1">LinkedIn</label>
                  <input className="input" value={profile.linkedin} onChange={e => setProfile(f => ({ ...f, linkedin: e.target.value }))} placeholder="linkedin.com/in/username" />
                </div>
                <div className="col-span-2">
                  <label className="block text-xs font-medium text-ink-secondary mb-1">Bio</label>
                  <textarea className="input" rows={3} value={profile.bio} onChange={e => setProfile(f => ({ ...f, bio: e.target.value }))} placeholder="Tell your team a bit about yourself" />
                </div>
              </div>
            </div>
          )}

          {/* ── Notifications ──────────────────────────────── */}
          {section === 'notifications' && (
            <div className="max-w-lg mx-auto space-y-6">
              <div>
                <h2 className="text-lg font-bold text-ink">Notifications</h2>
                <p className="text-sm text-ink-muted">Choose what you want to be notified about</p>
              </div>

              <div>
                <p className="text-xs font-semibold text-ink-muted uppercase tracking-wider mb-2">Activity</p>
                <div className="card divide-y divide-slate-100">
                  {[
                    { key: 'invoice_approved', label: 'Invoice Approved', desc: 'When an invoice you created is approved' },
                    { key: 'invoice_rejected', label: 'Invoice Rejected', desc: 'When an invoice is rejected by an approver' },
                    { key: 'low_stock', label: 'Low Stock Alerts', desc: 'When inventory drops below the reorder point' },
                    { key: 'payroll_ready', label: 'Payroll Ready', desc: 'When a payroll run is processed and awaiting approval' },
                    { key: 'fleet_alert', label: 'Fleet Alerts', desc: 'Vehicle maintenance reminders and GPS alerts' },
                  ].map(({ key, label, desc }) => (
                    <div key={key} className="flex items-center justify-between px-5 py-3.5">
                      <div>
                        <div className="text-sm font-medium text-ink">{label}</div>
                        <div className="text-xs text-ink-muted">{desc}</div>
                      </div>
                      <Toggle checked={notifications[key as keyof typeof notifications]} onChange={v => setNotifications(n => ({ ...n, [key]: v }))} />
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <p className="text-xs font-semibold text-ink-muted uppercase tracking-wider mb-2">Delivery</p>
                <div className="card divide-y divide-slate-100">
                  {[
                    { key: 'browser_push', label: 'Browser Push', desc: 'Real-time push notifications in your browser' },
                    { key: 'email_digest', label: 'Daily Email Digest', desc: 'Summary of key metrics delivered each morning' },
                    { key: 'weekly_summary', label: 'Weekly Summary', desc: 'A weekly report on business performance' },
                    { key: 'sound', label: 'Notification Sound', desc: 'Play a chime when a new notification arrives' },
                  ].map(({ key, label, desc }) => (
                    <div key={key} className="flex items-center justify-between px-5 py-3.5">
                      <div>
                        <div className="text-sm font-medium text-ink">{label}</div>
                        <div className="text-xs text-ink-muted">{desc}</div>
                      </div>
                      <Toggle checked={notifications[key as keyof typeof notifications]} onChange={v => setNotifications(n => ({ ...n, [key]: v }))} />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ── Security ───────────────────────────────────── */}
          {section === 'security' && (
            <div className="max-w-lg mx-auto space-y-6">
              <div>
                <h2 className="text-lg font-bold text-ink">Security</h2>
                <p className="text-sm text-ink-muted">Manage your password and account security</p>
              </div>

              <div className="card p-5 space-y-4">
                <h3 className="font-semibold text-ink">Change Password</h3>
                <div>
                  <label htmlFor="current-pw" className="block text-xs font-medium text-ink-secondary mb-1">Current Password</label>
                  <input id="current-pw" className="input" type="password" placeholder="••••••••" />
                </div>
                <div>
                  <label htmlFor="new-pw" className="block text-xs font-medium text-ink-secondary mb-1">New Password</label>
                  <input id="new-pw" className="input" type="password" placeholder="Min 8 characters" />
                </div>
                <div>
                  <label htmlFor="confirm-pw" className="block text-xs font-medium text-ink-secondary mb-1">Confirm New Password</label>
                  <input id="confirm-pw" className="input" type="password" placeholder="••••••••" />
                </div>
                <button type="button" className="btn-primary">Update Password</button>
              </div>

              <div className="card p-5 space-y-4">
                <h3 className="font-semibold text-ink">Two-Factor Authentication</h3>
                <p className="text-sm text-ink-muted">Add an extra layer of security by requiring a one-time code when you sign in.</p>
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm font-medium text-ink">Authenticator App (TOTP)</div>
                    <div className="text-xs text-ink-muted">Google Authenticator, Authy, etc.</div>
                  </div>
                  <Toggle checked={security.two_factor} onChange={v => setSecurity(s => ({ ...s, two_factor: v }))} />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm font-medium text-ink">Login Alerts via Email</div>
                    <div className="text-xs text-ink-muted">Get notified of new sign-ins to your account</div>
                  </div>
                  <Toggle checked={security.login_alerts} onChange={v => setSecurity(s => ({ ...s, login_alerts: v }))} />
                </div>
              </div>

              <div className="card p-5">
                <h3 className="font-semibold text-ink mb-1">Session Timeout</h3>
                <p className="text-xs text-ink-muted mb-3">Automatically sign you out after a period of inactivity</p>
                <div className="flex gap-2">
                  {['1h', '4h', '8h', '24h'].map(t => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setSecurity(s => ({ ...s, session_timeout: t }))}
                      className={clsx(
                        'flex-1 py-2 rounded-xl border text-sm font-medium transition-all',
                        security.session_timeout === t
                          ? 'border-primary-500 bg-primary-50 text-primary-700'
                          : 'border-slate-200 text-ink-muted hover:border-slate-300'
                      )}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>

              <div className="card p-5">
                <h3 className="font-semibold text-ink mb-1">Active Sessions</h3>
                <p className="text-xs text-ink-muted mb-4">Devices currently signed in to your account</p>
                <div className="space-y-3">
                  {[
                    { device: 'Chrome · Windows 11', location: 'Kigali, Rwanda', icon: Monitor, active: true },
                    { device: 'Safari · iPhone 15', location: 'Kigali, Rwanda', icon: Smartphone, active: false },
                    { device: 'Chrome · iPad Pro', location: 'Huye, Rwanda', icon: Tablet, active: false },
                  ].map(({ device, location, icon: Icon, active }) => (
                    <div key={device} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-slate-100 rounded-lg flex items-center justify-center">
                          <Icon className="w-4 h-4 text-ink-muted" />
                        </div>
                        <div>
                          <div className="text-sm font-medium text-ink">{device}</div>
                          <div className="text-xs text-ink-muted">{location}</div>
                        </div>
                      </div>
                      {active
                        ? <span className="badge-green text-xs">Current</span>
                        : <button type="button" className="text-xs text-danger hover:text-red-700 font-medium">Revoke</button>
                      }
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ── Appearance ─────────────────────────────────── */}
          {section === 'appearance' && (
            <div className="max-w-lg mx-auto space-y-6">
              <div>
                <h2 className="text-lg font-bold text-ink">Appearance</h2>
                <p className="text-sm text-ink-muted">Customize how SyncFlow looks for you</p>
              </div>

              <div className="card p-5 space-y-5">
                <div>
                  <label className="block text-sm font-medium text-ink mb-2">Theme</label>
                  <div className="flex gap-3">
                    {[
                      { value: 'light', label: 'Light', preview: '☀️' },
                      { value: 'dark', label: 'Dark', preview: '🌙' },
                      { value: 'system', label: 'System', preview: '💻' },
                    ].map(({ value, label, preview }) => (
                      <button
                        key={value}
                        type="button"
                        onClick={() => setAppearance(a => ({ ...a, theme: value }))}
                        className={clsx(
                          'flex-1 flex flex-col items-center gap-1.5 py-3 rounded-xl border text-sm font-medium transition-all',
                          appearance.theme === value
                            ? 'border-primary-500 bg-primary-50 text-primary-700'
                            : 'border-slate-200 text-ink-muted hover:border-slate-300'
                        )}
                      >
                        <span className="text-lg">{preview}</span>
                        {label}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-ink mb-2">Density</label>
                  <div className="flex gap-3">
                    {['Compact', 'Comfortable', 'Spacious'].map(v => (
                      <button
                        key={v}
                        type="button"
                        onClick={() => setAppearance(a => ({ ...a, density: v.toLowerCase() }))}
                        className={clsx(
                          'flex-1 py-2.5 rounded-xl border text-sm font-medium transition-all',
                          appearance.density === v.toLowerCase()
                            ? 'border-primary-500 bg-primary-50 text-primary-700'
                            : 'border-slate-200 text-ink-muted hover:border-slate-300'
                        )}
                      >
                        {v}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex items-center justify-between pt-1 border-t border-slate-100">
                  <div>
                    <div className="text-sm font-medium text-ink">Reduce Motion</div>
                    <div className="text-xs text-ink-muted">Disable animations and transitions</div>
                  </div>
                  <Toggle checked={appearance.reduced_motion} onChange={v => setAppearance(a => ({ ...a, reduced_motion: v }))} />
                </div>
              </div>
            </div>
          )}

          {/* ── Language & Region ──────────────────────────── */}
          {section === 'locale' && (
            <div className="max-w-lg mx-auto space-y-6">
              <div>
                <h2 className="text-lg font-bold text-ink">Language & Region</h2>
                <p className="text-sm text-ink-muted">Set your preferred language, currency, and timezone</p>
              </div>

              <div className="card p-5 space-y-4">
                {[
                  { key: 'language', label: 'Language', options: [{ value: 'en', label: 'English' }, { value: 'fr', label: 'Français' }, { value: 'rw', label: 'Kinyarwanda' }] },
                  { key: 'currency', label: 'Default Currency', options: [{ value: 'RWF', label: 'Rwandan Franc (RWF)' }, { value: 'USD', label: 'US Dollar (USD)' }, { value: 'EUR', label: 'Euro (EUR)' }, { value: 'KES', label: 'Kenyan Shilling (KES)' }] },
                  { key: 'timezone', label: 'Timezone', options: [{ value: 'Africa/Kigali', label: 'Africa/Kigali (UTC+2)' }, { value: 'Africa/Nairobi', label: 'Africa/Nairobi (UTC+3)' }, { value: 'UTC', label: 'UTC' }, { value: 'Europe/London', label: 'Europe/London' }] },
                  { key: 'date_format', label: 'Date Format', options: [{ value: 'DD/MM/YYYY', label: 'DD/MM/YYYY' }, { value: 'MM/DD/YYYY', label: 'MM/DD/YYYY' }, { value: 'YYYY-MM-DD', label: 'YYYY-MM-DD (ISO)' }] },
                ].map(({ key, label, options }) => (
                  <div key={key}>
                    <label className="block text-xs font-medium text-ink-secondary mb-1">{label}</label>
                    <select aria-label={label} className="input" value={locale[key as keyof typeof locale]} onChange={e => setLocale(l => ({ ...l, [key]: e.target.value }))}>
                      {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                    </select>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ── Integrations ───────────────────────────────── */}
          {section === 'integrations' && (
            <div className="max-w-lg mx-auto space-y-6">
              <div>
                <h2 className="text-lg font-bold text-ink">Integrations</h2>
                <p className="text-sm text-ink-muted">Connect SyncFlow to the tools your team already uses</p>
              </div>

              <div className="space-y-3">
                {INTEGRATIONS.map(({ id, name, desc, logo, connected, badge }) => (
                  <div key={id} className="card p-4 flex items-center gap-4">
                    <div className="w-11 h-11 bg-slate-100 rounded-xl flex items-center justify-center text-2xl shrink-0">
                      {logo}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className="text-sm font-semibold text-ink">{name}</span>
                        {connected && badge && (
                          <span className="text-[10px] font-medium bg-primary-50 text-primary-600 border border-primary-100 rounded-full px-2 py-0.5">{badge}</span>
                        )}
                      </div>
                      <p className="text-xs text-ink-muted">{desc}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => toast.success(connected ? `${name} disconnected` : `${name} connected`)}
                      className={clsx(
                        'shrink-0 text-xs font-semibold px-3.5 py-1.5 rounded-lg transition-colors',
                        connected
                          ? 'bg-red-50 text-danger hover:bg-red-100'
                          : 'bg-primary-50 text-primary-700 hover:bg-primary-100'
                      )}
                    >
                      {connected ? 'Disconnect' : 'Connect'}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ── API Keys ───────────────────────────────────── */}
          {section === 'api_keys' && (
            <div className="max-w-lg mx-auto space-y-6">
              <div>
                <h2 className="text-lg font-bold text-ink">API Keys</h2>
                <p className="text-sm text-ink-muted">Manage keys for programmatic access to SyncFlow</p>
              </div>

              <div className="card p-4 bg-amber-50 border-amber-100">
                <p className="text-xs text-amber-800">
                  <strong>Keep your keys secret.</strong> Never share them in code, emails, or client-side apps. Rotate keys immediately if you suspect a compromise.
                </p>
              </div>

              <div className="space-y-3">
                {MOCK_API_KEYS.map(k => (
                  <div key={k.id} className="card p-4">
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <div>
                        <div className="text-sm font-semibold text-ink">{k.name}</div>
                        <div className="text-xs text-ink-muted">{k.scope} · Created {k.created}</div>
                      </div>
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => toast.success('Key rotated — update your services')}
                          className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-slate-100 text-ink-muted hover:text-ink transition-colors"
                          title="Rotate key"
                        >
                          <RefreshCw className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => toast.success('API key deleted')}
                          className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-red-50 text-ink-muted hover:text-danger transition-colors"
                          title="Delete key"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-lg px-3 py-2">
                      <code className="flex-1 text-xs font-mono text-ink-secondary">
                        {showKey[k.id] ? 'sf_live_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx' : k.prefix}
                      </code>
                      <button
                        type="button"
                        onClick={() => setShowKey(s => ({ ...s, [k.id]: !s[k.id] }))}
                        aria-label={showKey[k.id] ? 'Hide key' : 'Show key'}
                        className="text-ink-muted hover:text-ink transition-colors"
                      >
                        {showKey[k.id] ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                      </button>
                      <button
                        type="button"
                        aria-label="Copy key"
                        onClick={() => copyToClipboard('sf_live_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx')}
                        className="text-ink-muted hover:text-ink transition-colors"
                      >
                        <Copy className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    <p className="text-[10px] text-ink-muted mt-1.5">Last used {k.last_used}</p>
                  </div>
                ))}
              </div>

              <div className="card p-4 space-y-3">
                <h3 className="text-sm font-semibold text-ink">Create New Key</h3>
                <div className="flex gap-2">
                  <input
                    className="input flex-1"
                    placeholder="Key name (e.g. Reporting service)"
                    value={newKeyName}
                    onChange={e => setNewKeyName(e.target.value)}
                  />
                  <button
                    type="button"
                    onClick={() => { if (newKeyName.trim()) { toast.success(`Key "${newKeyName}" created`); setNewKeyName('') } }}
                    className="btn-primary gap-1.5 shrink-0"
                  >
                    <Plus className="w-4 h-4" />Generate
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ── Save button (not shown for API Keys / Integrations) ── */}
          {!['api_keys', 'integrations'].includes(section) && (
            <div className="mt-8 max-w-lg mx-auto">
              <button type="button" onClick={handleSave} disabled={saving} className="btn-primary gap-2">
                {saving
                  ? <><Loader2 className="w-4 h-4 animate-spin" />Saving…</>
                  : saved
                  ? <><Check className="w-4 h-4" />Saved!</>
                  : <><Save className="w-4 h-4" />Save Changes</>
                }
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
