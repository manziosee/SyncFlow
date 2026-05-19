'use client'

import { useState, useRef, useEffect } from 'react'
import { Calendar, Settings2, Plus, X, Check, ChevronLeft, ChevronRight } from 'lucide-react'
import * as Tabs from '@radix-ui/react-tabs'
import clsx from 'clsx'

const TABS = ['Main', 'Unit', 'Marketing', 'Investors']
const MONTHS_FULL = ['January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December']
const MONTHS_SHORT = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

const KPI_BY_TAB: Record<string, Array<{ label: string; value: string; cents?: string; trend: number; positive: boolean }>> = {
  Main: [
    { label: 'TOTAL BALANCE',    value: '1,230,340', cents: '.69', trend: 7.5,  positive: true  },
    { label: 'EBITDA',           value: '253,110',   cents: '.25', trend: 5.5,  positive: true  },
    { label: 'INCOME',           value: '455,770',   cents: '.88', trend: 11.2, positive: true  },
    { label: 'OUTCOME',          value: '-567,000',  cents: '.03', trend: 1.5,  positive: false },
    { label: 'GROWTH RATE MoM',  value: '9.56%',     cents: '',    trend: 2.1,  positive: true  },
  ],
  Unit: [
    { label: 'UNITS SOLD',       value: '4,820',     cents: '',    trend: 14.3, positive: true  },
    { label: 'AVG UNIT PRICE',   value: '94,500',    cents: '.00', trend: 3.1,  positive: true  },
    { label: 'UNIT REVENUE',     value: '455,770',   cents: '.88', trend: 11.2, positive: true  },
    { label: 'RETURNS',          value: '142',        cents: '',    trend: 0.8,  positive: false },
    { label: 'NET UNITS',        value: '4,678',     cents: '',    trend: 15.1, positive: true  },
  ],
  Marketing: [
    { label: 'NEW CUSTOMERS',    value: '318',        cents: '',    trend: 22.4, positive: true  },
    { label: 'RETENTION RATE',   value: '87.3%',     cents: '',    trend: 4.1,  positive: true  },
    { label: 'CAC',              value: '43,200',    cents: '.00', trend: 8.5,  positive: false },
    { label: 'LTV',              value: '612,000',   cents: '.00', trend: 17.2, positive: true  },
    { label: 'CONV. RATE',       value: '6.4%',      cents: '',    trend: 1.2,  positive: true  },
  ],
  Investors: [
    { label: 'ARR',              value: '5.47M',     cents: '',    trend: 31.0, positive: true  },
    { label: 'MRR',              value: '456,000',   cents: '.00', trend: 9.6,  positive: true  },
    { label: 'BURN RATE',        value: '124,000',   cents: '.00', trend: 2.1,  positive: false },
    { label: 'RUNWAY',           value: '18 mo',     cents: '',    trend: 0,    positive: true  },
    { label: 'GROSS MARGIN',     value: '68.2%',     cents: '',    trend: 3.4,  positive: true  },
  ],
}

const VISIBLE_DEFAULT = ['Total Revenue', 'Invoices', 'Employees', 'Fleet', 'Inventory']
const ALL_WIDGETS = ['Total Revenue', 'Invoices', 'Employees', 'Fleet', 'Inventory', 'Cashflow', 'Payroll', 'CRM']

interface HeroHeaderProps {
  activeTab: string
  onTabChange: (tab: string) => void
  selectedMonth?: number
  selectedYear?: number
  onMonthChange?: (month: number, year: number) => void
}

export default function HeroHeader({
  activeTab, onTabChange,
  selectedMonth, selectedYear,
  onMonthChange,
}: HeroHeaderProps) {
  const now = new Date()
  const [calOpen, setCalOpen]     = useState(false)
  const [manageOpen, setManageOpen] = useState(false)
  const [pickerMonth, setPickerMonth] = useState(selectedMonth ?? now.getMonth())
  const [pickerYear, setPickerYear]   = useState(selectedYear ?? now.getFullYear())
  const [visible, setVisible]       = useState<string[]>(VISIBLE_DEFAULT)
  const calRef = useRef<HTMLDivElement>(null)

  const isCurrentMonth = pickerMonth === now.getMonth() && pickerYear === now.getFullYear()

  const applyMonth = () => {
    onMonthChange?.(pickerMonth, pickerYear)
    setCalOpen(false)
  }

  const prevMonth = () => {
    if (pickerMonth === 0) { setPickerMonth(11); setPickerYear(y => y - 1) }
    else setPickerMonth(m => m - 1)
  }
  const nextMonth = () => {
    if (pickerMonth === 11) { setPickerMonth(0); setPickerYear(y => y + 1) }
    else setPickerMonth(m => m + 1)
  }

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (calRef.current && !calRef.current.contains(e.target as Node)) setCalOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const displayLabel = isCurrentMonth
    ? 'this month'
    : `${MONTHS_SHORT[pickerMonth]} ${pickerYear}`

  const kpis = KPI_BY_TAB[activeTab] ?? KPI_BY_TAB.Main

  return (
    <>
      <div className="relative w-full overflow-hidden shrink-0 min-h-[230px]">
        {/* Background */}
        <img
          src="https://images.unsplash.com/photo-1536849460588-696219a9e98d?crop=entropy&cs=srgb&fm=jpg&ixlib=rb-4.1.0&q=85"
          alt=""
          className="absolute inset-0 w-full h-full object-cover"
          aria-hidden="true"
        />
        <div className="absolute inset-0 hero-overlay" aria-hidden="true" />

        {/* Content */}
        <div className="relative z-10 flex flex-col h-full px-8 pt-6 pb-0">

          {/* Top row */}
          <div className="flex items-start justify-between mb-4">
            {/* Title + calendar picker */}
            <div className="relative" ref={calRef}>
              <h1 className="text-3xl font-bold text-white leading-tight flex items-center gap-3 flex-wrap">
                Overview for{' '}
                <button
                  type="button"
                  onClick={() => setCalOpen(o => !o)}
                  className="flex items-center gap-2 text-orange-400 hover:text-orange-300 transition-colors group"
                >
                  <span className="underline decoration-orange-400/50 underline-offset-4">{displayLabel}</span>
                  <span className="inline-flex items-center justify-center w-7 h-7 rounded-lg bg-white/15 backdrop-blur-sm group-hover:bg-white/25 transition-colors">
                    <Calendar className="w-4 h-4 text-white" />
                  </span>
                </button>
              </h1>

              {/* Calendar dropdown */}
              {calOpen && (
                <div className="absolute top-full left-0 mt-2 z-50 bg-white rounded-2xl shadow-2xl border border-slate-100 p-4 w-64">
                  <div className="flex items-center justify-between mb-3">
                    <button type="button" aria-label="Previous month" onClick={prevMonth} className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-slate-100 text-slate-500 transition-colors">
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    <span className="text-sm font-bold text-slate-800">{MONTHS_FULL[pickerMonth]} {pickerYear}</span>
                    <button type="button" aria-label="Next month" onClick={nextMonth} className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-slate-100 text-slate-500 transition-colors">
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="grid grid-cols-3 gap-1.5 mb-3">
                    {MONTHS_SHORT.map((m, idx) => (
                      <button
                        key={m}
                        type="button"
                        onClick={() => setPickerMonth(idx)}
                        className={clsx(
                          'py-1.5 rounded-xl text-xs font-semibold transition-colors',
                          pickerMonth === idx
                            ? 'bg-orange-500 text-white'
                            : 'text-slate-600 hover:bg-slate-100'
                        )}
                      >
                        {m}
                      </button>
                    ))}
                  </div>
                  <div className="flex items-center justify-between gap-2">
                    <button
                      type="button"
                      onClick={() => { setPickerMonth(now.getMonth()); setPickerYear(now.getFullYear()); }}
                      className="text-xs text-orange-600 hover:text-orange-700 font-medium"
                    >
                      Current month
                    </button>
                    <button
                      type="button"
                      onClick={applyMonth}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-orange-500 hover:bg-orange-400 text-white text-xs font-bold rounded-xl transition-colors"
                    >
                      <Check className="w-3.5 h-3.5" />Apply
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Manage space */}
            <button
              type="button"
              onClick={() => setManageOpen(true)}
              className="flex items-center gap-2 text-white text-xs font-medium bg-white/15 backdrop-blur-sm border border-white/25 hover:bg-white/25 transition-colors px-3 py-1.5 rounded-lg shrink-0 mt-1"
            >
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
                type="button"
                className="w-7 h-7 flex items-center justify-center rounded-full text-white/70 hover:text-white hover:bg-white/15 transition-colors ml-1"
                aria-label="Add view"
                onClick={() => setManageOpen(true)}
              >
                <Plus className="w-4 h-4" />
              </button>
            </Tabs.List>
          </Tabs.Root>

          {/* KPI Strip */}
          <div className="flex gap-2 pb-0 overflow-x-auto no-scrollbar">
            {kpis.map(m => (
              <div
                key={m.label}
                className="flex-1 min-w-[140px] backdrop-blur-md rounded-t-xl px-4 pt-3 pb-3 flex flex-col gap-1.5 border border-white/50 border-b-0 bg-white/85"
              >
                <span className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider leading-none">
                  {m.label}
                </span>
                <div className="flex items-baseline gap-0.5">
                  <span className="text-lg font-bold text-gray-900 leading-none">
                    {m.label === 'TOTAL BALANCE' || m.label === 'EBITDA' || m.label === 'INCOME' || m.label === 'ARR'
                      ? '$' : ''}
                    {m.value}
                  </span>
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
                  {m.trend > 0 ? `${m.trend}%` : 'No change'}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Manage Space Modal ──────────────────────────────── */}
      {manageOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-sm shadow-2xl">
            <div className="flex items-center justify-between p-5 border-b border-slate-100">
              <div>
                <h3 className="font-bold text-slate-900 text-base">Manage Dashboard</h3>
                <p className="text-xs text-slate-500 mt-0.5">Choose which widgets to display</p>
              </div>
              <button type="button" onClick={() => setManageOpen(false)} aria-label="Close" className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-5 space-y-2">
              {ALL_WIDGETS.map(widget => {
                const on = visible.includes(widget)
                return (
                  <button
                    key={widget}
                    type="button"
                    onClick={() => setVisible(v => on ? v.filter(x => x !== widget) : [...v, widget])}
                    className={clsx(
                      'w-full flex items-center justify-between px-4 py-3 rounded-xl border transition-all text-sm font-medium',
                      on ? 'border-orange-200 bg-orange-50 text-orange-700' : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                    )}
                  >
                    {widget}
                    <div className={clsx(
                      'w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors',
                      on ? 'border-orange-500 bg-orange-500' : 'border-slate-300'
                    )}>
                      {on && <Check className="w-3 h-3 text-white" />}
                    </div>
                  </button>
                )
              })}
            </div>
            <div className="p-5 border-t border-slate-100 flex gap-2">
              <button type="button" onClick={() => setVisible(VISIBLE_DEFAULT)} className="flex-1 py-2 rounded-xl border border-slate-200 text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors">
                Reset
              </button>
              <button type="button" onClick={() => setManageOpen(false)} className="flex-1 py-2 rounded-xl bg-orange-500 hover:bg-orange-400 text-white text-sm font-semibold transition-colors">
                Save Layout
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
