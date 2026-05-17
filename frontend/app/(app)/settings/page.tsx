'use client'

import { useState } from 'react'
import { useAuth } from '@/lib/auth-context'
import Topbar from '@/components/layout/Topbar'
import {
  User, Bell, Shield, Palette, Globe, LogOut,
  Save, Loader2, Check
} from 'lucide-react'
import clsx from 'clsx'
import toast from 'react-hot-toast'

const SECTIONS = [
  { id: 'profile', label: 'Profile', icon: User },
  { id: 'notifications', label: 'Notifications', icon: Bell },
  { id: 'security', label: 'Security', icon: Shield },
  { id: 'appearance', label: 'Appearance', icon: Palette },
  { id: 'locale', label: 'Language & Region', icon: Globe },
]

function Toggle({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      onClick={() => onChange(!checked)}
      className={clsx(
        'relative w-10 h-5.5 rounded-full transition-colors shrink-0',
        checked ? 'bg-primary-500' : 'bg-slate-200'
      )}
      style={{ height: '22px', minWidth: '40px' }}
    >
      <span className={clsx(
        'absolute top-0.5 w-4 h-4 bg-white rounded-full shadow-sm transition-transform',
        checked ? 'translate-x-5' : 'translate-x-0.5'
      )} />
    </button>
  )
}

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
  })

  const [notifications, setNotifications] = useState({
    invoice_approved: true,
    invoice_rejected: true,
    low_stock: true,
    payroll_ready: true,
    fleet_alert: false,
    email_digest: true,
    sound: false,
  })

  const [appearance, setAppearance] = useState({
    theme: 'light',
    density: 'comfortable',
    sidebar_collapsed: false,
  })

  const [locale, setLocale] = useState({
    language: 'en',
    currency: 'RWF',
    timezone: 'Africa/Kigali',
    date_format: 'DD/MM/YYYY',
  })

  const handleSave = async () => {
    setSaving(true)
    await new Promise(r => setTimeout(r, 800))
    setSaving(false)
    setSaved(true)
    toast.success('Settings saved')
    setTimeout(() => setSaved(false), 2000)
  }

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <Topbar title="Settings" subtitle="Manage your account and preferences" />

      <div className="flex-1 overflow-hidden flex">
        {/* Sidebar nav */}
        <aside className="w-52 border-r border-slate-100 py-4 shrink-0 overflow-y-auto">
          {SECTIONS.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
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

          <div className="mt-auto pt-4 px-4">
            <button
              onClick={logout}
              className="w-full flex items-center gap-2 text-sm text-danger hover:bg-danger-bg px-3 py-2 rounded-lg transition-colors font-medium"
            >
              <LogOut className="w-4 h-4" />
              Sign out
            </button>
          </div>
        </aside>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {section === 'profile' && (
            <div className="max-w-lg space-y-6">
              <div>
                <h2 className="text-lg font-bold text-ink">Profile</h2>
                <p className="text-sm text-ink-muted">Update your personal information</p>
              </div>

              {/* Avatar */}
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center text-primary-700 font-bold text-2xl">
                  {profile.name?.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() || 'U'}
                </div>
                <div>
                  <div className="font-semibold text-ink">{profile.name || 'User'}</div>
                  <div className="text-xs text-ink-muted capitalize">{user?.role?.replace('_', ' ')}</div>
                  <button className="text-xs text-primary-600 hover:text-primary-700 mt-1 font-medium">Change photo</button>
                </div>
              </div>

              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-medium text-ink-secondary mb-1">Full Name</label>
                  <input className="input" value={profile.name} onChange={e => setProfile(f => ({ ...f, name: e.target.value }))} />
                </div>
                <div>
                  <label className="block text-xs font-medium text-ink-secondary mb-1">Email</label>
                  <input className="input" type="email" value={profile.email} onChange={e => setProfile(f => ({ ...f, email: e.target.value }))} />
                </div>
                <div>
                  <label className="block text-xs font-medium text-ink-secondary mb-1">Phone</label>
                  <input className="input" value={profile.phone} onChange={e => setProfile(f => ({ ...f, phone: e.target.value }))} placeholder="+250 788 000 000" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-ink-secondary mb-1">Bio</label>
                  <textarea className="input" rows={3} value={profile.bio} onChange={e => setProfile(f => ({ ...f, bio: e.target.value }))} placeholder="Tell your team a bit about yourself" />
                </div>
              </div>
            </div>
          )}

          {section === 'notifications' && (
            <div className="max-w-lg space-y-6">
              <div>
                <h2 className="text-lg font-bold text-ink">Notifications</h2>
                <p className="text-sm text-ink-muted">Choose what you want to be notified about</p>
              </div>

              <div className="card divide-y divide-slate-100">
                {[
                  { key: 'invoice_approved', label: 'Invoice Approved', desc: 'When an invoice you created is approved' },
                  { key: 'invoice_rejected', label: 'Invoice Rejected', desc: 'When an invoice is rejected by an approver' },
                  { key: 'low_stock', label: 'Low Stock Alerts', desc: 'When inventory drops below reorder point' },
                  { key: 'payroll_ready', label: 'Payroll Ready', desc: 'When a payroll run is processed and awaiting approval' },
                  { key: 'fleet_alert', label: 'Fleet Alerts', desc: 'Vehicle maintenance reminders and GPS alerts' },
                  { key: 'email_digest', label: 'Daily Email Digest', desc: 'Summary of key metrics delivered each morning' },
                  { key: 'sound', label: 'Notification Sound', desc: 'Play a sound when a new notification arrives' },
                ].map(({ key, label, desc }) => (
                  <div key={key} className="flex items-center justify-between px-5 py-3.5">
                    <div>
                      <div className="text-sm font-medium text-ink">{label}</div>
                      <div className="text-xs text-ink-muted">{desc}</div>
                    </div>
                    <Toggle
                      checked={notifications[key as keyof typeof notifications]}
                      onChange={v => setNotifications(n => ({ ...n, [key]: v }))}
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {section === 'security' && (
            <div className="max-w-lg space-y-6">
              <div>
                <h2 className="text-lg font-bold text-ink">Security</h2>
                <p className="text-sm text-ink-muted">Manage your password and security settings</p>
              </div>

              <div className="card p-5 space-y-4">
                <h3 className="font-semibold text-ink">Change Password</h3>
                <div>
                  <label className="block text-xs font-medium text-ink-secondary mb-1">Current Password</label>
                  <input className="input" type="password" placeholder="••••••••" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-ink-secondary mb-1">New Password</label>
                  <input className="input" type="password" placeholder="Min 8 characters" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-ink-secondary mb-1">Confirm New Password</label>
                  <input className="input" type="password" placeholder="••••••••" />
                </div>
                <button className="btn-primary">Update Password</button>
              </div>

              <div className="card p-5">
                <h3 className="font-semibold text-ink mb-1">Active Sessions</h3>
                <p className="text-xs text-ink-muted mb-4">You&apos;re signed in on these devices</p>
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm font-medium text-ink">Current session</div>
                    <div className="text-xs text-ink-muted">Browser · Kigali, Rwanda</div>
                  </div>
                  <span className="badge-green">Active</span>
                </div>
              </div>
            </div>
          )}

          {section === 'appearance' && (
            <div className="max-w-lg space-y-6">
              <div>
                <h2 className="text-lg font-bold text-ink">Appearance</h2>
                <p className="text-sm text-ink-muted">Customize how SyncFlow looks</p>
              </div>

              <div className="card p-5 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-ink mb-2">Theme</label>
                  <div className="flex gap-3">
                    {[
                      { value: 'light', label: 'Light' },
                      { value: 'dark', label: 'Dark' },
                      { value: 'system', label: 'System' },
                    ].map(({ value, label }) => (
                      <button
                        key={value}
                        onClick={() => setAppearance(a => ({ ...a, theme: value }))}
                        className={clsx(
                          'flex-1 py-2.5 rounded-xl border text-sm font-medium transition-all',
                          appearance.theme === value
                            ? 'border-primary-500 bg-primary-50 text-primary-700'
                            : 'border-slate-200 text-ink-muted hover:border-slate-300'
                        )}
                      >
                        {label}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-ink mb-2">Density</label>
                  <div className="flex gap-3">
                    {[
                      { value: 'compact', label: 'Compact' },
                      { value: 'comfortable', label: 'Comfortable' },
                      { value: 'spacious', label: 'Spacious' },
                    ].map(({ value, label }) => (
                      <button
                        key={value}
                        onClick={() => setAppearance(a => ({ ...a, density: value }))}
                        className={clsx(
                          'flex-1 py-2.5 rounded-xl border text-sm font-medium transition-all',
                          appearance.density === value
                            ? 'border-primary-500 bg-primary-50 text-primary-700'
                            : 'border-slate-200 text-ink-muted hover:border-slate-300'
                        )}
                      >
                        {label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {section === 'locale' && (
            <div className="max-w-lg space-y-6">
              <div>
                <h2 className="text-lg font-bold text-ink">Language & Region</h2>
                <p className="text-sm text-ink-muted">Set your preferred language, currency, and timezone</p>
              </div>

              <div className="card p-5 space-y-4">
                {[
                  { key: 'language', label: 'Language', options: [{ value: 'en', label: 'English' }, { value: 'fr', label: 'Français' }, { value: 'rw', label: 'Kinyarwanda' }] },
                  { key: 'currency', label: 'Currency', options: [{ value: 'RWF', label: 'Rwandan Franc (RWF)' }, { value: 'USD', label: 'US Dollar (USD)' }, { value: 'EUR', label: 'Euro (EUR)' }] },
                  { key: 'timezone', label: 'Timezone', options: [{ value: 'Africa/Kigali', label: 'Africa/Kigali (UTC+2)' }, { value: 'UTC', label: 'UTC' }, { value: 'Europe/London', label: 'Europe/London' }] },
                  { key: 'date_format', label: 'Date Format', options: [{ value: 'DD/MM/YYYY', label: 'DD/MM/YYYY' }, { value: 'MM/DD/YYYY', label: 'MM/DD/YYYY' }, { value: 'YYYY-MM-DD', label: 'YYYY-MM-DD' }] },
                ].map(({ key, label, options }) => (
                  <div key={key}>
                    <label className="block text-xs font-medium text-ink-secondary mb-1">{label}</label>
                    <select
                      className="input"
                      value={locale[key as keyof typeof locale]}
                      onChange={e => setLocale(l => ({ ...l, [key]: e.target.value }))}
                    >
                      {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                    </select>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Save button */}
          <div className="mt-8 max-w-lg">
            <button onClick={handleSave} disabled={saving} className="btn-primary gap-2">
              {saving ? (
                <><Loader2 className="w-4 h-4 animate-spin" />Saving…</>
              ) : saved ? (
                <><Check className="w-4 h-4" />Saved!</>
              ) : (
                <><Save className="w-4 h-4" />Save Changes</>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
