"use client"

import type React from "react"

import { useState } from "react"
import { getWriteContract } from "@/lib/ethers"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ethers } from "ethers"

export default function DonateForm() {
  const [amountEth, setAmountEth] = useState<string>("")
  const [loading, setLoading] = useState(false)
  const [txHash, setTxHash] = useState<string>("")

  async function onDonate(e: React.FormEvent) {
    e.preventDefault()
    setTxHash("")
    try {
      setLoading(true)
      const contract = await getWriteContract()
      const value = ethers.parseEther(amountEth || "0")
      if (value <= 0n) {
        throw new Error("Enter an amount greater than 0")
      }
      const tx = await contract.donate({ value })
      const receipt = await tx.wait()
      setTxHash(receipt?.hash || tx.hash)
      setAmountEth("")
    } catch (err: any) {
      alert(err?.message || "Donation failed")
      console.error("[v0] donate error:", err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Donate ETH</CardTitle>
        <CardDescription>Support verified relief efforts with a secure on-chain donation.</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={onDonate} className="flex items-center gap-3">
          <Input
            type="number"
            min="0"
            step="0.0001"
            value={amountEth}
            onChange={(e) => setAmountEth(e.target.value)}
            placeholder="Amount in ETH"
            aria-label="Amount in ETH"
          />
          <Button type="submit" disabled={loading}>
            {loading ? "Processing..." : "Donate"}
          </Button>
        </form>
        {txHash ? <p className="mt-3 text-xs break-all">Tx: {txHash}</p> : null}
      </CardContent>
    </Card>
  )
}
