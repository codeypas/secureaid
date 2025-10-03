"use client"

import useSWR from "swr"
import { getReadContract } from "@/lib/ethers"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ethers } from "ethers"

const fetchTotal = async () => {
  const c = await getReadContract()
  const v = await c.getTotalFunds()
  return v as bigint
}

const fetchDonors = async () => {
  const c = await getReadContract()
  const list: string[] = await c.getDonorList()
  return list
}

export default function StatsCards() {
  const { data: totalFunds, mutate: refetchTotal } = useSWR("totalFunds", fetchTotal, { refreshInterval: 5000 })
  const { data: donors, mutate: refetchDonors } = useSWR("donors", fetchDonors, { refreshInterval: 10000 })

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <Card>
        <CardHeader>
          <CardTitle>Total Funds</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-2xl font-semibold">
            {typeof totalFunds === "bigint" ? `${ethers.formatEther(totalFunds)} ETH` : "—"}
          </p>
        </CardContent>
      </Card>

      <Card className="md:col-span-2">
        <CardHeader>
          <CardTitle>Donors (addresses)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="max-h-40 overflow-auto text-sm space-y-1">
            {Array.isArray(donors) && donors.length > 0 ? (
              donors.map((d, i) => (
                <div key={i} className="break-all">
                  {d}
                </div>
              ))
            ) : (
              <div>No donors yet.</div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
