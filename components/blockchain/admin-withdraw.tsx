"use client"

import { useEffect, useState } from "react"
import { getWriteContract, getReadContract } from "@/lib/ethers"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default function AdminWithdraw() {
  const [isOwner, setIsOwner] = useState<boolean>(false)
  const [to, setTo] = useState<string>("")

  useEffect(() => {
    async function checkOwner() {
      try {
        const read = await getReadContract()
        // Many OZ Ownable contracts include owner() view, not part of ABI we shipped.
        // We’ll try/catch in case not present in ABI.
        try {
          const owner = await (read as any).owner?.()
          const accounts = await (window as any).ethereum.request({ method: "eth_accounts" })
          setIsOwner(owner && accounts?.[0] && owner.toLowerCase() === accounts[0].toLowerCase())
        } catch {
          // If owner() isn't available in ABI, hide the UI rather than error.
          setIsOwner(false)
        }
      } catch {
        setIsOwner(false)
      }
    }
    checkOwner()
  }, [])

  async function withdraw() {
    try {
      const write = await getWriteContract()
      const tx = await write.withdrawFunds(to)
      await tx.wait()
      alert("Withdraw complete")
    } catch (e: any) {
      alert(e?.message || "Withdraw failed")
      console.error("[v0] withdraw error:", e)
    }
  }

  if (!isOwner) return null

  return (
    <Card>
      <CardHeader>
        <CardTitle>Admin Withdraw</CardTitle>
        <CardDescription>Owner-only: transfer all funds to a verified address.</CardDescription>
      </CardHeader>
      <CardContent className="flex items-center gap-3">
        <Input placeholder="Recipient address (0x...)" value={to} onChange={(e) => setTo(e.target.value)} />
        <Button onClick={withdraw} disabled={!to}>
          Withdraw All
        </Button>
      </CardContent>
    </Card>
  )
}
