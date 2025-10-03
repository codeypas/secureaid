"use client"
import { useWeb3 } from "../contexts/Web3Context"
import { toast } from "react-toastify"

const WalletConnection = () => {
  const { account, isConnected, isLoading, connectWallet, disconnectWallet, networkId } = useWeb3()

  const handleConnect = async () => {
    try {
      await connectWallet()
      toast.success("Wallet connected successfully!")
    } catch (error) {
      if (error.message.includes("MetaMask is not installed")) {
        toast.error("Please install MetaMask to continue")
      } else {
        toast.error("Failed to connect wallet")
      }
    }
  }

  const handleDisconnect = () => {
    disconnectWallet()
    toast.info("Wallet disconnected")
  }

  const formatAddress = (address) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`
  }

  if (isLoading) {
    return (
      <div className="flex items-center space-x-2">
        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
        <span>Connecting...</span>
      </div>
    )
  }

  if (isConnected) {
    return (
      <div className="flex items-center space-x-4">
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 bg-green-500 rounded-full"></div>
          <span className="text-sm font-medium">{formatAddress(account)}</span>
          <span className="text-xs text-gray-500">Network: {networkId}</span>
        </div>
        <button
          onClick={handleDisconnect}
          className="px-4 py-2 text-sm bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
        >
          Disconnect
        </button>
      </div>
    )
  }

  return (
    <button
      onClick={handleConnect}
      className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
    >
      Connect Wallet
    </button>
  )
}

export default WalletConnection
