'use client'

import { Calendar, Settings2, Plus } from 'lucide-react'
import * as Tabs from '@radix-ui/react-tabs'
import clsx from 'clsx'

const TABS = ['Main', 'Unit', 'Marketing', 'Investors']

const KPI_METRICS = [
  { label: 'TOTAL BALANCE', value: '$1,230,340', cents: '.69', trend: 7.5, positive: true },
  { label: 'EBITDA',        value: '$253,110',   cents: '.25', trend: 5.5, positive: true },
  { label: 'INCOME',        value: '$455,770',   cents: '.88', trend: 11.2, positive: true },
  { label: 'OUTCOME',       value: '-$567,000',  cents: '.03', trend: 1.5, positive: false },
  { label: 'GROWTH RATE MoM', value: '9.56%',   cents: '',    trend: 2.1, positive: true },
]

interface HeroHeaderProps {
  activeTab: string
  onTabChange: (tab: string) => void
}

export default function HeroHeader({ activeTab, onTabChange }: HeroHeaderProps) {
  return (
    <div className="relative w-full overflow-hidden shrink-0" style={{ minHeight: 230 }}>
      {/* Abstract art background */}
      <img
        src="https://images.unsplash.com/photo-1536849460588-696219a9e98d?crop=entropy&cs=srgb&fm=jpg&ixlib=rb-4.1.0&q=85"
        alt="Abstract art background by Steve A Johnson on Unsplash"
        className="absolute inset-0 w-full h-full object-cover"
        aria-hidden="true"
      />
      {/* Gradient overlay — dark on left/bottom for legibility */}
      <div
        className="absolute inset-0"
        style={{ background: 'linear-gradient(135deg, rgba(0,0,0,0.45) 0%, rgba(0,0,0,0.15) 60%, rgba(0,0,0,0.08) 100%)' }}
        aria-hidden="true"
      />

      {/* Content */}
      <div className="relative z-10 flex flex-col h-full px-8 pt-6 pb-0">
        {/* Top row */}
        <div className="flex items-start justify-between mb-4">
          <h1 className="text-3xl font-bold text-white leading-tight flex items-center gap-3 flex-wrap">
            Overview for{' '}
            <span className="text-orange-400">this month</span>
            <button
              className="inline-flex items-center justify-center w-7 h-7 rounded-lg bg-white/15 backdrop-blur-sm hover:bg-white/25 transition-colors"
              aria-label="Select month"
            >
              <Calendar className="w-4 h-4 text-white" />
            </button>
          </h1>

          <button className="flex items-center gap-2 text-white text-xs font-medium bg-white/15 backdrop-blur-sm border border-white/25 hover:bg-white/25 transition-colors px-3 py-1.5 rounded-lg shrink-0 mt-1">
            <Settings2 className="w-3.5 h-3.5" />
            Manage space
          </button>
        </div>

        {/* Tabs */}
        <Tabs.Root value={activeTab} onValueChange={onTabChange}>
          <Tabs.List className="flex items-center gap-1 mb-4" aria-label="Dashboard views">
            {TABS.map(tab => (
              <Tabs.Trigger
                key={tab}
                value={tab}
                className={clsx(
                  'px-4 py-1.5 rounded-full text-sm font-medium transition-all duration-150',
                  activeTab === tab
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-white/75 hover:text-white hover:bg-white/15'
                )}
              >
                {tab}
              </Tabs.Trigger>
            ))}
            <button
              className="w-7 h-7 flex items-center justify-center rounded-full text-white/70 hover:text-white hover:bg-white/15 transition-colors ml-1"
              aria-label="Add view"
            >
              <Plus className="w-4 h-4" />
            </button>
          </Tabs.List>
        </Tabs.Root>

        {/* KPI Strip */}
        <div className="flex gap-2 pb-0 -mb-0 overflow-x-auto no-scrollbar">
          {KPI_METRICS.map((m) => (
            <div
              key={m.label}
              className="flex-1 min-w-[140px] bg-white/88 backdrop-blur-md rounded-t-xl px-4 pt-3 pb-3 flex flex-col gap-1.5 border border-white/50 border-b-0"
              style={{ background: 'rgba(255,255,255,0.88)' }}
            >
              <span className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider leading-none">
                {m.label}
              </span>
              <div className="flex items-baseline gap-0.5">
                <span className="text-lg font-bold text-gray-900 leading-none">{m.value}</span>
                {m.cents && <span className="text-xs font-semibold text-gray-500">{m.cents}</span>}
              </div>
              <div className={clsx(
                'flex items-center gap-1 text-[11px] font-semibold',
                m.positive ? 'text-emerald-600' : 'text-red-500'
              )}>
                <svg className="w-3 h-3" viewBox="0 0 12 12" fill="currentColor" aria-hidden="true">
                  {m.positive
                    ? <path d="M6 2.5l4 5H2l4-5z" />
                    : <path d="M6 9.5L2 4.5h8l-4 5z" />
                  }
                </svg>
                {m.trend}%
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
