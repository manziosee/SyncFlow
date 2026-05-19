'use client'

import { AlertTriangle, ArrowRight, Flame } from 'lucide-react'

const CASHFLOW = {
  incomeCount: 2,
  income: 552230,
  outcomeCount: 11,
  outcome: -200340,
  totalExpected: 1426230.54,
  totalItems: 13,
}

const MRR = 356053

function fmtCompact(n: number) {
  const abs = Math.abs(n)
  const sign = n < 0 ? '-' : ''
  if (abs >= 1_000_000) return `${sign}$${(abs / 1_000_000).toFixed(1)}M`
  if (abs >= 1_000) return `${sign}$${(abs / 1_000).toFixed(0)}K`
  return `${sign}$${abs}`
}

function fmtFull(n: number) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency', currency: 'USD',
    minimumFractionDigits: 2, maximumFractionDigits: 2,
  }).format(n)
}

export default function CashflowCard() {
  return (
    <div className="flex flex-col gap-4 h-full">
      {/* Cashflow widget */}
      <div className="card p-5 flex-shrink-0">
        <h2 className="text-base font-bold text-gray-900 mb-4">Cashflow</h2>

        {/* Income row */}
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-gray-500">
            Income{' '}
            <span className="text-xs font-semibold bg-gray-100 text-gray-600 rounded-full px-1.5 py-0.5 ml-1">
              {CASHFLOW.incomeCount}
            </span>
          </span>
          <span className="text-base font-bold text-emerald-600">
            {fmtCompact(CASHFLOW.income)}
          </span>
        </div>

        {/* Outcome row */}
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm text-gray-500">
            Outcome{' '}
            <span className="text-xs font-semibold bg-gray-100 text-gray-600 rounded-full px-1.5 py-0.5 ml-1">
              {CASHFLOW.outcomeCount}
            </span>
          </span>
          <span className="text-base font-bold text-gray-800">
            {fmtCompact(CASHFLOW.outcome)}
          </span>
        </div>

        {/* Alert */}
        <div className="flex items-center gap-2 bg-orange-50 border border-orange-200 rounded-xl px-3 py-2.5 mb-4">
          <AlertTriangle className="w-4 h-4 text-orange-500 shrink-0" aria-hidden="true" />
          <p className="text-xs font-medium text-orange-700 leading-tight">
            Risk of cash gap on{' '}
            <span className="font-bold underline decoration-dotted cursor-pointer hover:text-orange-900 transition-colors">
              Mar 25th
            </span>
          </p>
        </div>

        {/* Total expected balance */}
        <div className="mb-4">
          <div className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-1">
            Total expected balance
          </div>
          <div className="text-2xl font-bold text-gray-900 leading-tight">
            {fmtFull(CASHFLOW.totalExpected)}
          </div>
        </div>

        {/* See all button */}
        <button className="w-full bg-gray-900 hover:bg-gray-700 text-white text-sm font-semibold py-2.5 rounded-xl transition-colors flex items-center justify-center gap-2">
          See all
          <span className="text-xs bg-white/20 rounded-full px-2 py-0.5">{CASHFLOW.totalItems}</span>
        </button>
      </div>

      {/* Runway */}
      <div className="card p-5 flex-shrink-0">
        <div className="flex items-start gap-4">
          {/* Months number */}
          <div className="shrink-0">
            <div className="text-4xl font-black text-gray-900 leading-none">9</div>
            <div className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mt-1 leading-tight">
              MONTHS<br />OF RUNAWAY
            </div>
          </div>

          {/* Runway bar + info */}
          <div className="flex-1 min-w-0">
            <p className="text-[11px] text-gray-400 mb-2 leading-tight">
              Ideal runaway is 12-18 months
            </p>
            {/* Bar */}
            <div className="relative h-5 bg-gray-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-emerald-400 to-emerald-500 rounded-full"
                style={{ width: '50%' }}
                aria-label="9 of 18 months runway"
              />
              {/* Cash-out marker */}
              <div
                className="absolute top-0 bottom-0 w-0.5 bg-orange-400"
                style={{ left: '50%' }}
                aria-hidden="true"
              />
            </div>
            {/* Label */}
            <div className="flex justify-end mt-1.5">
              <span className="text-[10px] font-semibold text-orange-500 bg-orange-50 border border-orange-200 rounded-full px-2 py-0.5 flex items-center gap-1">
                <Flame className="w-2.5 h-2.5" aria-hidden="true" />
                Cash out Apr 2023
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* MRR */}
      <div className="card p-5 flex-1">
        <div className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-1">MRR</div>
        <div className="flex items-baseline gap-1">
          <span className="text-2xl font-bold text-gray-900">{fmtCompact(MRR)}</span>
          <span className="text-xs text-gray-400">/ mo</span>
        </div>
        <div className="flex items-center gap-1 text-[11px] font-semibold text-emerald-600 mt-1">
          <svg className="w-3 h-3" viewBox="0 0 12 12" fill="currentColor" aria-hidden="true">
            <path d="M6 2.5l4 5H2l4-5z" />
          </svg>
          8.1%
        </div>
      </div>
    </div>
  )
}
