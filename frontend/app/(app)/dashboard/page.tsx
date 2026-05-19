'use client'

import { useState } from 'react'
import HeroHeader from '@/components/dashboard/HeroHeader'
import AccountsCard from '@/components/dashboard/AccountsCard'
import CashflowCard from '@/components/dashboard/CashflowCard'
import TransferPanel from '@/components/dashboard/TransferPanel'

export default function DashboardPage() {
  const [activeTab, setActiveTab] = useState('Main')

  return (
    <div className="flex flex-col h-full overflow-hidden bg-white">
      {/* Hero header with abstract art + KPI strip */}
      <HeroHeader activeTab={activeTab} onTabChange={setActiveTab} />

      {/* Main content */}
      <div className="flex-1 overflow-y-auto bg-gray-50">
        <div className="p-5 grid grid-cols-1 lg:grid-cols-3 gap-4 min-h-full">
          {/* Left column: Accounts + Users composition */}
          <div className="flex flex-col gap-4">
            <AccountsCard />
          </div>

          {/* Middle column: Cashflow + Runway + MRR */}
          <div className="flex flex-col gap-4">
            <CashflowCard />
          </div>

          {/* Right column: Transfer funds */}
          <div className="flex flex-col gap-4">
            <TransferPanel />
          </div>
        </div>
      </div>
    </div>
  )
}
