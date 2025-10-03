"use client"

import { createContext, useContext, useState, useEffect } from "react"
import { ethers } from "ethers"
import contractData from "../contracts/contract.json"

const Web3Context = createContext()

export const useWeb3 = () => {
  const context = useContext(Web3Context)
  if (!context) {
    throw new Error("useWeb3 must be used within a Web3Provider")
  }
  return context
}

export const Web3Provider = ({ children }) => {
  const [account, setAccount] = useState(null)
  const [provider, setProvider] = useState(null)
  const [contract, setContract] = useState(null)
  const [isConnected, setIsConnected] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [networkId, setNetworkId] = useState(null)

  const connectWallet = async () => {
    if (typeof window.ethereum !== "undefined") {
      try {
        setIsLoading(true)

        // Request account access
        await window.ethereum.request({ method: "eth_requestAccounts" })

        const provider = new ethers.BrowserProvider(window.ethereum)
        const signer = await provider.getSigner()
        const address = await signer.getAddress()
        const network = await provider.getNetwork()

        // Initialize contract
        const contractInstance = new ethers.Contract(contractData.address, JSON.parse(contractData.abi), signer)

        setProvider(provider)
        setAccount(address)
        setContract(contractInstance)
        setNetworkId(network.chainId.toString())
        setIsConnected(true)

        // Store connection state
        localStorage.setItem("walletConnected", "true")
      } catch (error) {
        console.error("Error connecting wallet:", error)
        throw error
      } finally {
        setIsLoading(false)
      }
    } else {
      throw new Error("MetaMask is not installed")
    }
  }

  const disconnectWallet = () => {
    setAccount(null)
    setProvider(null)
    setContract(null)
    setIsConnected(false)
    setNetworkId(null)
    localStorage.removeItem("walletConnected")
  }

  const switchNetwork = async (targetNetworkId) => {
    if (typeof window.ethereum !== "undefined") {
      try {
        await window.ethereum.request({
          method: "wallet_switchEthereumChain",
          params: [{ chainId: `0x${Number.parseInt(targetNetworkId).toString(16)}` }],
        })
      } catch (error) {
        console.error("Error switching network:", error)
        throw error
      }
    }
  }

  // Auto-connect on page load if previously connected
  useEffect(() => {
    const wasConnected = localStorage.getItem("walletConnected")
    if (wasConnected === "true" && typeof window.ethereum !== "undefined") {
      connectWallet().catch(console.error)
    }
  }, [])

  // Listen for account changes
  useEffect(() => {
    if (typeof window.ethereum !== "undefined") {
      const handleAccountsChanged = (accounts) => {
        if (accounts.length === 0) {
          disconnectWallet()
        } else if (accounts[0] !== account) {
          setAccount(accounts[0])
        }
      }

      const handleChainChanged = (chainId) => {
        setNetworkId(Number.parseInt(chainId, 16).toString())
        window.location.reload() // Reload to reset contract instance
      }

      window.ethereum.on("accountsChanged", handleAccountsChanged)
      window.ethereum.on("chainChanged", handleChainChanged)

      return () => {
        window.ethereum.removeListener("accountsChanged", handleAccountsChanged)
        window.ethereum.removeListener("chainChanged", handleChainChanged)
      }
    }
  }, [account])

  const value = {
    account,
    provider,
    contract,
    isConnected,
    isLoading,
    networkId,
    connectWallet,
    disconnectWallet,
    switchNetwork,
  }

  return <Web3Context.Provider value={value}>{children}</Web3Context.Provider>
}
