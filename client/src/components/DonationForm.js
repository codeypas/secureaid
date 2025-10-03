"use client"

import { useState } from "react"
import { useWeb3 } from "../contexts/Web3Context"
import { ethers } from "ethers"
import { toast } from "react-toastify"

const DonationForm = ({ campaignId, onDonationSuccess }) => {
  const { contract, isConnected, account } = useWeb3()
  const [amount, setAmount] = useState("")
  const [message, setMessage] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const handleDonate = async (e) => {
    e.preventDefault()

    if (!isConnected) {
      toast.error("Please connect your wallet first")
      return
    }

    if (!amount || Number.parseFloat(amount) <= 0) {
      toast.error("Please enter a valid donation amount")
      return
    }

    try {
      setIsLoading(true)

      const donationAmount = ethers.parseEther(amount)
      const tx = await contract.donate(campaignId, message || "", {
        value: donationAmount,
      })

      toast.info("Transaction submitted. Waiting for confirmation...")

      const receipt = await tx.wait()

      toast.success(`Donation successful! Transaction: ${receipt.hash}`)

      // Reset form
      setAmount("")
      setMessage("")

      // Callback to refresh campaign data
      if (onDonationSuccess) {
        onDonationSuccess()
      }
    } catch (error) {
      console.error("Donation error:", error)

      if (error.code === "ACTION_REJECTED") {
        toast.error("Transaction was rejected")
      } else if (error.message.includes("insufficient funds")) {
        toast.error("Insufficient funds for this transaction")
      } else {
        toast.error("Donation failed. Please try again.")
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h3 className="text-xl font-semibold mb-4 text-gray-800">Make a Donation</h3>

      <form onSubmit={handleDonate} className="space-y-4">
        <div>
          <label htmlFor="amount" className="block text-sm font-medium text-gray-700 mb-2">
            Donation Amount (ETH)
          </label>
          <input
            type="number"
            id="amount"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="0.01"
            step="0.001"
            min="0"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            required
          />
        </div>

        <div>
          <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">
            Message (Optional)
          </label>
          <textarea
            id="message"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Leave a message of support..."
            rows="3"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
          />
        </div>

        <button
          type="submit"
          disabled={!isConnected || isLoading}
          className={`w-full py-3 px-4 rounded-md font-medium transition-colors ${
            isConnected && !isLoading
              ? "bg-blue-600 hover:bg-blue-700 text-white"
              : "bg-gray-300 text-gray-500 cursor-not-allowed"
          }`}
        >
          {isLoading ? (
            <div className="flex items-center justify-center space-x-2">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              <span>Processing...</span>
            </div>
          ) : (
            "Donate Now"
          )}
        </button>

        {!isConnected && <p className="text-sm text-gray-500 text-center">Connect your wallet to make a donation</p>}
      </form>
    </div>
  )
}

export default DonationForm
