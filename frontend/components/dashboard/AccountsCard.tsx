'use client'

import { Settings2, TrendingUp, TrendingDown } from 'lucide-react'
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts'
import clsx from 'clsx'

const ACCOUNTS = [
  {
    id: 'brex',
    name: 'Brex',
    acct: '*3472',
    balance: 150311.94,
    prev: 50981.29,
    trend: 30.3,
    bgColor: 'bg-orange-500',
    abbr: 'B',
  },
  {
    id: 'svb',
    name: 'Silicon Valley Bank',
    acct: '*2349',
    balance: 235665.01,
    prev: 1963.55,
    trend: 1.2,
    bgColor: 'bg-indigo-500',
    abbr: 'wb',
  },
  {
    id: 'chase',
    name: 'Chase Bank',
    acct: '*9907',
    balance: 851099.03,
    prev: 1301090.67,
    trend: 96.3,
    bgColor: 'bg-blue-600',
    abbr: '⬛',
  },
  {
    id: 'square',
    name: 'Square',
    acct: '*8976',
    balance: 9085.03,
    prev: 2530.08,
    trend: 0.3,
    bgColor: 'bg-gray-900',
    abbr: '■',
  },
]

const PIE_DATA = [
  { name: 'New',  value: 14833, color: '#7C3AED' },
  { name: 'Paid', value: 8200,  color: '#14B8A6' },
  { name: 'Other', value: 3100, color: '#E2E8F0' },
]

function fmt(n: number) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(n)
}

export default function AccountsCard() {
  return (
    <div className="flex flex-col gap-4 h-full">
      {/* Accounts list */}
      <div className="card p-0 overflow-hidden flex-shrink-0">
        {/* Header */}
        <div className="flex items-center justify-between px-5 pt-5 pb-3">
          <h2 className="text-base font-bold text-gray-900">
            Accounts <span className="text-gray-400 font-semibold text-sm ml-1">{ACCOUNTS.length}</span>
          </h2>
          <button className="flex items-center gap-1.5 text-xs font-medium text-gray-500 hover:text-gray-800 transition-colors">
            <Settings2 className="w-3.5 h-3.5" />
            Manage
          </button>
        </div>

        {/* Account rows */}
        <div className="divide-y divide-gray-50">
          {ACCOUNTS.map(acc => (
            <div
              key={acc.id}
              className="flex items-center gap-3 px-5 py-3 hover:bg-gray-50/60 transition-colors cursor-pointer group"
            >
              {/* Bank icon */}
              <div className={clsx(
                'w-9 h-9 rounded-xl flex items-center justify-center text-white text-xs font-bold shrink-0 shadow-sm',
                acc.bgColor
              )}>
                {acc.abbr === '⬛' || acc.abbr === '■' ? (
                  <div className="w-4 h-4 bg-white/90 rounded-sm" aria-hidden="true" />
                ) : (
                  <span className="uppercase">{acc.abbr}</span>
                )}
              </div>

              {/* Name + acct */}
              <div className="flex-1 min-w-0">
                <div className="text-sm font-semibold text-gray-800 truncate">{acc.name}</div>
                <div className="text-[11px] text-gray-400">{acc.acct}</div>
              </div>

              {/* Balance + trend */}
              <div className="text-right shrink-0">
                <div className="text-sm font-bold text-gray-900">{fmt(acc.balance)}</div>
                <div className="flex items-center justify-end gap-1 mt-0.5">
                  <span className="text-[10px] text-gray-400">{fmt(acc.prev)}</span>
                  <span className={clsx(
                    'inline-flex items-center gap-0.5 text-[10px] font-semibold px-1.5 py-0.5 rounded-full',
                    acc.trend >= 0
                      ? 'bg-emerald-50 text-emerald-600'
                      : 'bg-red-50 text-red-500'
                  )}>
                    <TrendingUp className="w-2.5 h-2.5" aria-hidden="true" />
                    {acc.trend}%
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Users composition */}
      <div className="card p-5 flex-1">
        <h3 className="text-sm font-bold text-gray-900 mb-3">Users composition</h3>
        <div className="flex items-center gap-4">
          {/* Stats */}
          <div className="flex flex-col gap-3">
            <div>
              <div className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">NEW</div>
              <div className="flex items-baseline gap-1.5 mt-0.5">
                <span className="text-2xl font-bold text-gray-900">14,833</span>
              </div>
              <div className="flex items-center gap-1 text-[11px] font-semibold text-emerald-600 mt-0.5">
                <TrendingUp className="w-3 h-3" aria-hidden="true" />
                30.3%
              </div>
            </div>
            <div>
              <div className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">PAID</div>
              <div className="text-xl font-bold text-gray-900 mt-0.5">8,200</div>
            </div>
          </div>

          {/* Donut chart */}
          <div className="flex-1" style={{ minWidth: 0, height: 120 }}>
            <ResponsiveContainer width="100%" height={120}>
              <PieChart>
                <Pie
                  data={PIE_DATA}
                  cx="50%"
                  cy="50%"
                  innerRadius={34}
                  outerRadius={54}
                  dataKey="value"
                  strokeWidth={2}
                  stroke="#fff"
                >
                  {PIE_DATA.map((entry, i) => (
                    <Cell key={i} fill={entry.color} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  )
}
