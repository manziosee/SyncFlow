'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useAuth } from '@/lib/auth-context'
import {
  LayoutDashboard, FileText, Package, Users, Truck,
  Brain, BarChart3, LogOut, Settings, Zap, ChevronLeft,
  ShoppingCart, Globe, Bell
} from 'lucide-react'
import clsx from 'clsx'

const nav = [
  { href: '/dashboard',  label: 'Dashboard',    icon: LayoutDashboard },
  { href: '/invoices',   label: 'Invoices',      icon: FileText },
  { href: '/inventory',  label: 'Inventory',     icon: Package },
  { href: '/hr',         label: 'HR & Payroll',  icon: Users },
  { href: '/customers',  label: 'Customers',     icon: ShoppingCart },
  { href: '/fleet',      label: 'Fleet',         icon: Truck },
  { href: '/ai',         label: 'AI Assistant',  icon: Brain },
  { href: '/reports',    label: 'Reports',       icon: BarChart3 },
]

interface SidebarProps {
  collapsed?: boolean
  onToggle?: () => void
}

export default function Sidebar({ collapsed = false, onToggle }: SidebarProps) {
  const pathname = usePathname()
  const { user, logout } = useAuth()

  const initials = user?.name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || 'U'

  return (
    <aside
      className={clsx(
        'flex flex-col bg-sidebar h-screen transition-all duration-300 relative shrink-0',
        collapsed ? 'w-16' : 'w-60'
      )}
      style={{ boxShadow: '2px 0 12px 0 rgb(0 0 0 / 0.15)' }}
    >
      {/* Logo */}
      <div className={clsx('flex items-center h-16 px-4 border-b border-sidebar-border shrink-0', collapsed ? 'justify-center' : 'gap-3')}>
        <div className="w-8 h-8 bg-primary-500 rounded-lg flex items-center justify-center shrink-0 shadow-md shadow-primary-500/30">
          <Zap className="w-4 h-4 text-white" />
        </div>
        {!collapsed && (
          <div>
            <div className="text-white font-bold text-base leading-tight">SyncFlow</div>
            <div className="text-primary-400 text-xs">Real-Time ERP</div>
          </div>
        )}
      </div>

      {/* Toggle button */}
      <button
        onClick={onToggle}
        className="absolute -right-3 top-20 w-6 h-6 bg-sidebar-hover border border-sidebar-border rounded-full flex items-center justify-center text-sidebar-text hover:text-white transition-colors z-10"
      >
        <ChevronLeft className={clsx('w-3 h-3 transition-transform', collapsed && 'rotate-180')} />
      </button>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto py-4 px-2 space-y-0.5 no-scrollbar">
        {!collapsed && (
          <div className="px-3 mb-2 text-[10px] font-semibold text-sidebar-icon uppercase tracking-widest">
            Main Menu
          </div>
        )}

        {nav.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || pathname.startsWith(href + '/')
          return (
            <Link
              key={href}
              href={href}
              title={collapsed ? label : undefined}
              className={clsx(
                'nav-item',
                active && 'active',
                collapsed && 'justify-center px-0'
              )}
            >
              <Icon className={clsx('nav-icon shrink-0', active && 'text-primary-400')} />
              {!collapsed && <span>{label}</span>}
              {!collapsed && active && (
                <span className="ml-auto w-1.5 h-1.5 bg-primary-400 rounded-full" />
              )}
            </Link>
          )
        })}

        {!collapsed && (
          <div className="px-3 mt-4 mb-2 text-[10px] font-semibold text-sidebar-icon uppercase tracking-widest">
            Account
          </div>
        )}

        <Link
          href="/settings"
          title={collapsed ? 'Settings' : undefined}
          className={clsx('nav-item', collapsed && 'justify-center px-0')}
        >
          <Settings className="nav-icon shrink-0" />
          {!collapsed && <span>Settings</span>}
        </Link>
      </nav>

      {/* User */}
      <div className={clsx('border-t border-sidebar-border p-3', collapsed && 'flex justify-center')}>
        {collapsed ? (
          <div className="w-8 h-8 bg-primary-500/20 rounded-full flex items-center justify-center text-primary-400 font-bold text-xs">
            {initials}
          </div>
        ) : (
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-primary-500/20 rounded-full flex items-center justify-center text-primary-400 font-bold text-xs shrink-0">
              {initials}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-white text-xs font-semibold truncate">{user?.name || 'User'}</div>
              <div className="text-sidebar-text text-[10px] capitalize truncate">{user?.role?.replace('_', ' ')}</div>
            </div>
            <button
              onClick={logout}
              title="Sign out"
              className="text-sidebar-icon hover:text-red-400 transition-colors p-1 rounded"
            >
              <LogOut className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>
    </aside>
  )
}
