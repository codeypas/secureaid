"use client"

import { useState } from "react"
import ConnectWallet from "@/components/blockchain/connect-wallet"
import DonateForm from "@/components/blockchain/donate-form"
import StatsCards from "@/components/blockchain/stats-cards"
import AdminWithdraw from "@/components/blockchain/admin-withdraw"
import { Card, CardContent } from "@/components/ui/card"

export default function Page() {
  const [connected, setConnected] = useState<string | null>(null)

  return (
    <main className="mx-auto max-w-3xl p-6 space-y-6">
      <header className="flex items-center justify-between">
        <h1 className="text-balance text-2xl font-semibold">SecureAid Fundraising</h1>
        <ConnectWallet onConnected={(addr) => setConnected(addr)} />
      </header>

      <StatsCards />

      <DonateForm />

      <Card>
        <CardContent className="text-sm leading-relaxed p-4">
          All donations are processed via Ethereum smart contracts for transparency, integrity, and traceability.
          Connect your wallet to donate in ETH. Admin can withdraw to verified NGO/Govt wallets.
        </CardContent>
      </Card>

      <AdminWithdraw />
    </main>
  )
}
