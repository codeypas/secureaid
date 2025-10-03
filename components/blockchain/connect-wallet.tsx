"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"

export default function ConnectWallet({
  onConnected,
}: {
  onConnected?: (address: string) => void
}) {
  const [address, setAddress] = useState<string | null>(null)
  const [hasProvider, setHasProvider] = useState<boolean>(false)

  useEffect(() => {
    // Detect provider
    const eth = (window as any).ethereum
    setHasProvider(Boolean(eth))

    if (eth) {
      eth.request({ method: "eth_accounts" }).then((accounts: string[]) => {
        if (accounts?.[0]) {
          setAddress(accounts[0])
          onConnected?.(accounts[0])
        }
      })

      eth.on("accountsChanged", (accounts: string[]) => {
        if (accounts?.[0]) {
          setAddress(accounts[0])
          onConnected?.(accounts[0])
        } else {
          setAddress(null)
        }
      })
    }
  }, [onConnected])

  async function connect() {
    try {
      const accounts = await (window as any).ethereum.request({
        method: "eth_requestAccounts",
      })
      setAddress(accounts[0])
      onConnected?.(accounts[0])
    } catch (e) {
      console.error("[v0] Wallet connect error:", e)
    }
  }

  if (!hasProvider) {
    return <div className="text-sm">MetaMask not detected. Install MetaMask to continue.</div>
  }

  return address ? (
    <div className="text-sm break-all">Connected: {address}</div>
  ) : (
    <Button onClick={connect}>Connect Wallet</Button>
  )
}
