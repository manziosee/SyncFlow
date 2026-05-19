'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useAuth } from '@/lib/auth-context'
import {
  LayoutDashboard, FileText, Package, Users, Truck,
  Brain, BarChart3, LogOut, Settings, ChevronLeft,
  TrendingUp, Zap,
} from 'lucide-react'
import clsx from 'clsx'
import * as Tooltip from '@radix-ui/react-tooltip'

const NAV_MAIN = [
  { href: '/dashboard',  label: 'Dashboards',  icon: LayoutDashboard },
  { href: '/invoices',   label: 'Invoices',     icon: FileText },
  { href: '/inventory',  label: 'Inventory',    icon: Package },
  { href: '/hr',         label: 'HR & Payroll', icon: Users },
  { href: '/customers',  label: 'Investors',    icon: TrendingUp },
  { href: '/fleet',      label: 'Fleet',        icon: Truck },
  { href: '/ai',         label: 'AI Assistant', icon: Brain },
  { href: '/reports',    label: 'Reports',      icon: BarChart3 },
]

interface SidebarProps {
  collapsed?: boolean
  onToggle?: () => void
}

function NavTooltip({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <Tooltip.Provider delayDuration={200}>
      <Tooltip.Root>
        <Tooltip.Trigger asChild>{children}</Tooltip.Trigger>
        <Tooltip.Portal>
          <Tooltip.Content
            side="right"
            sideOffset={10}
            className="bg-slate-800 text-white text-xs font-semibold px-3 py-1.5 rounded-lg shadow-xl border border-white/10 z-50 select-none"
          >
            {label}
            <Tooltip.Arrow className="fill-slate-800" />
          </Tooltip.Content>
        </Tooltip.Portal>
      </Tooltip.Root>
    </Tooltip.Provider>
  )
}

function NavItem({
  href, label, icon: Icon, active, collapsed,
}: {
  href: string; label: string; icon: React.ElementType; active: boolean; collapsed: boolean
}) {
  const link = (
    <Link
      href={href}
      className={clsx(
        'group relative flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 cursor-pointer',
        collapsed && 'justify-center px-0 mx-auto w-10',
        active
          ? 'bg-white/12 text-white shadow-sm'
          : 'text-slate-400 hover:text-white hover:bg-white/6'
      )}
    >
      {/* Left accent line for active */}
      {active && !collapsed && (
        <span className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 bg-orange-400 rounded-r-full" />
      )}
      <Icon className={clsx(
        'shrink-0 transition-colors',
        collapsed ? 'w-5 h-5' : 'w-4 h-4',
        active ? 'text-orange-400' : 'text-slate-500 group-hover:text-slate-300'
      )} />
      {!collapsed && (
        <>
          <span className="flex-1">{label}</span>
          {active && <span className="w-1.5 h-1.5 bg-orange-400 rounded-full shrink-0" />}
        </>
      )}
    </Link>
  )

  return collapsed ? (
    <NavTooltip label={label}>{link}</NavTooltip>
  ) : link
}

export default function Sidebar({ collapsed = false, onToggle }: SidebarProps) {
  const pathname = usePathname()
  const { user, logout } = useAuth()

  const initials = user?.name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || 'U'

  return (
    <aside
      className={clsx(
        'sidebar-bg relative flex flex-col h-screen shrink-0 transition-all duration-300',
        collapsed ? 'w-[68px]' : 'w-60'
      )}
    >
      {/* ── Logo ───────────────────────────────────────── */}
      <div className={clsx(
        'flex items-center h-16 px-4 shrink-0 border-b',
        collapsed ? 'justify-center' : 'gap-3',
        'border-white/[0.06]'
      )}>
        <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center shrink-0 shadow-sm">
          <span className="text-slate-950 font-black text-base leading-none">n.</span>
        </div>
        {!collapsed && (
          <div className="min-w-0">
            <div className="text-white font-bold text-sm leading-tight">SyncFlow</div>
            <div className="text-slate-500 text-[10px]">Financial</div>
          </div>
        )}
      </div>

      {/* ── Collapse toggle ────────────────────────────── */}
      <button
        type="button"
        onClick={onToggle}
        aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        className="absolute -right-3 top-[72px] w-6 h-6 bg-slate-800 border border-white/10 rounded-full flex items-center justify-center text-slate-400 hover:text-white hover:bg-slate-700 transition-all z-10 shadow-md"
      >
        <ChevronLeft className={clsx('w-3 h-3 transition-transform', collapsed && 'rotate-180')} />
      </button>

      {/* ── Navigation ─────────────────────────────────── */}
      <nav className="flex-1 overflow-y-auto py-4 no-scrollbar">
        {!collapsed && (
          <div className="px-4 mb-2 text-[9px] font-bold text-slate-600 uppercase tracking-[0.15em]">
            Main Menu
          </div>
        )}

        <div className={clsx('space-y-0.5', collapsed ? 'px-3' : 'px-2')}>
          {NAV_MAIN.map(item => (
            <NavItem
              key={item.href}
              {...item}
              active={pathname === item.href || pathname.startsWith(item.href + '/')}
              collapsed={collapsed}
            />
          ))}
        </div>

        {/* Account section */}
        <div className={clsx('mt-4', collapsed ? 'px-3' : 'px-2')}>
          {!collapsed && (
            <div className="px-2 mb-2 text-[9px] font-bold text-slate-600 uppercase tracking-[0.15em]">
              Account
            </div>
          )}
          <NavItem
            href="/settings"
            label="Settings"
            icon={Settings}
            active={pathname.startsWith('/settings')}
            collapsed={collapsed}
          />
        </div>
      </nav>

      {/* ── User section ───────────────────────────────── */}
      <div className={clsx(
        'border-t border-white/[0.06] p-3 shrink-0',
        collapsed && 'flex justify-center'
      )}>
        {collapsed ? (
          <NavTooltip label={user?.name || 'User'}>
            <button
              type="button"
              aria-label="User menu"
              className="w-9 h-9 rounded-full bg-orange-500/20 border border-orange-500/30 flex items-center justify-center text-orange-300 font-bold text-xs hover:bg-orange-500/30 transition-colors"
            >
              {initials}
            </button>
          </NavTooltip>
        ) : (
          <div className="flex items-center gap-2.5 px-1">
            <div className="w-8 h-8 bg-orange-500/20 border border-orange-500/30 rounded-full flex items-center justify-center text-orange-300 font-bold text-xs shrink-0">
              {initials}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-white text-xs font-semibold truncate leading-tight">{user?.name || 'User'}</div>
              <div className="text-slate-500 text-[10px] capitalize truncate leading-tight">
                {user?.role?.replace(/_/g, ' ') || 'Member'}
              </div>
            </div>
            <button
              type="button"
              onClick={logout}
              title="Sign out"
              className="text-slate-600 hover:text-red-400 transition-colors p-1 rounded-lg hover:bg-red-500/10 shrink-0"
            >
              <LogOut className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>
    </aside>
  )
}
