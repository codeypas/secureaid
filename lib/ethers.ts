"use client"

import { ethers } from "ethers"
import { CONTRACT_ABI, CONTRACT_ADDRESS } from "./contract"

declare global {
  interface Window {
    ethereum?: any
  }
}

export function getBrowserProvider(): ethers.BrowserProvider | null {
  if (typeof window === "undefined") return null
  if (!window.ethereum) return null
  return new ethers.BrowserProvider(window.ethereum)
}

export async function getSigner() {
  const provider = getBrowserProvider()
  if (!provider) throw new Error("No Ethereum provider found. Install MetaMask.")
  return await provider.getSigner()
}

export async function getReadContract() {
  const provider = getBrowserProvider()
  if (!provider) throw new Error("No provider")
  if (!CONTRACT_ADDRESS) throw new Error("Missing NEXT_PUBLIC_CONTRACT_ADDRESS")
  const net = await provider.getNetwork()
  // Optional: console.log("[v0] Network:", net.name);
  return new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, await provider)
}

export async function getWriteContract() {
  const signer = await getSigner()
  if (!CONTRACT_ADDRESS) throw new Error("Missing NEXT_PUBLIC_CONTRACT_ADDRESS")
  return new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer)
}
