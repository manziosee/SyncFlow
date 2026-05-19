'use client'

import { ArrowRight, FileText } from 'lucide-react'
import { useState } from 'react'

interface ShortcutItemProps {
  label: string
  defaultValue?: string
  placeholder?: string
}

function ShortcutItem({ label, defaultValue, placeholder }: ShortcutItemProps) {
  const [value, setValue] = useState(defaultValue || '')

  return (
    <div className="border-b border-gray-100 last:border-0 pb-4 last:pb-0 mb-4 last:mb-0">
      <div className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">
        Shortcut
      </div>
      <p className="text-xs font-medium text-gray-700 mb-3 leading-snug">{label}</p>
      <div className="flex items-center gap-2">
        <div className="flex-1 flex items-center gap-1.5 bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-sm text-gray-700">
          <span className="text-gray-400 font-medium">$</span>
          <input
            type="text"
            value={value}
            onChange={e => setValue(e.target.value)}
            placeholder={placeholder}
            className="flex-1 bg-transparent outline-none text-sm font-medium text-gray-800 placeholder:text-gray-400 min-w-0"
            aria-label={label}
          />
        </div>
        <button
          className="w-8 h-8 rounded-xl bg-gray-900 hover:bg-gray-700 text-white flex items-center justify-center shrink-0 transition-colors"
          aria-label={`Execute: ${label}`}
        >
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  )
}

export default function TransferPanel() {
  return (
    <div className="card p-0 overflow-hidden h-full flex flex-col">
      {/* Transfer funds header */}
      <div className="flex items-center gap-4 px-5 pt-5 pb-5 border-b border-gray-100">
        <div className="w-11 h-11 bg-orange-500 hover:bg-orange-600 transition-colors rounded-2xl flex items-center justify-center shrink-0 shadow-md shadow-orange-200 cursor-pointer">
          <ArrowRight className="w-5 h-5 text-white" aria-hidden="true" />
        </div>
        <h2 className="text-base font-bold text-gray-900 leading-tight">
          Transfer<br />funds
        </h2>
      </div>

      {/* Shortcuts */}
      <div className="px-5 py-4 flex-1 overflow-y-auto no-scrollbar">
        <ShortcutItem
          label="Transfer to my personal PayPal card"
          defaultValue="2,000"
        />
        <ShortcutItem
          label="Create a virtual card for vendor or subscription"
          placeholder="Enter limit"
        />

        {/* Workflow item */}
        <div className="mt-2">
          <div className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">
            Workflow
          </div>
          <button className="w-full flex items-center gap-3 text-left hover:bg-gray-50 rounded-xl p-2.5 -mx-2.5 transition-colors group">
            <div className="w-8 h-8 bg-blue-50 rounded-xl flex items-center justify-center shrink-0 group-hover:bg-blue-100 transition-colors">
              <FileText className="w-4 h-4 text-blue-500" aria-hidden="true" />
            </div>
            <p className="text-xs font-medium text-gray-700 leading-snug">
              Send to my mail referrals report in PDF
            </p>
          </button>
        </div>
      </div>
    </div>
  )
}
