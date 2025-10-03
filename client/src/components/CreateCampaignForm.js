"use client"

import { useState } from "react"
import { toast } from "react-toastify"
import { ethers } from "ethers"
import axios from "axios"

const CreateCampaignForm = ({ contract, onSuccess }) => {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    targetAmount: "",
    beneficiary: "",
    category: "disaster-relief",
    location: "",
  })
  const [isLoading, setIsLoading] = useState(false)

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!contract) {
      toast.error("Contract not connected")
      return
    }

    try {
      setIsLoading(true)

      // Validate form data
      if (!formData.title.trim()) {
        toast.error("Campaign title is required")
        return
      }

      if (!formData.description.trim()) {
        toast.error("Campaign description is required")
        return
      }

      if (!formData.targetAmount || Number.parseFloat(formData.targetAmount) <= 0) {
        toast.error("Valid target amount is required")
        return
      }

      if (!ethers.isAddress(formData.beneficiary)) {
        toast.error("Valid beneficiary address is required")
        return
      }

      // Get next campaign ID
      const campaignCounter = await contract.campaignCounter()
      const campaignId = Number(campaignCounter)

      // Create campaign on blockchain
      const targetAmountWei = ethers.parseEther(formData.targetAmount)
      const tx = await contract.createCampaign(
        formData.title,
        formData.description,
        targetAmountWei,
        formData.beneficiary,
      )

      toast.info("Transaction submitted. Waiting for confirmation...")
      await tx.wait()

      // Save campaign metadata to database
      await axios.post("/api/campaigns", {
        campaignId,
        title: formData.title,
        description: formData.description,
        targetAmount: formData.targetAmount,
        beneficiary: formData.beneficiary,
        category: formData.category,
        location: formData.location,
      })

      toast.success("Campaign created successfully!")

      // Reset form
      setFormData({
        title: "",
        description: "",
        targetAmount: "",
        beneficiary: "",
        category: "disaster-relief",
        location: "",
      })

      // Call success callback
      if (onSuccess) {
        onSuccess()
      }
    } catch (error) {
      console.error("Error creating campaign:", error)

      if (error.code === "ACTION_REJECTED") {
        toast.error("Transaction was rejected")
      } else if (error.message.includes("insufficient funds")) {
        toast.error("Insufficient funds for transaction")
      } else {
        toast.error("Failed to create campaign")
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-2xl font-semibold text-gray-800 mb-6">Create New Campaign</h2>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Title */}
          <div className="md:col-span-2">
            <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
              Campaign Title *
            </label>
            <input
              type="text"
              id="title"
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="Emergency Relief for Disaster Victims"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
              maxLength="200"
            />
          </div>

          {/* Description */}
          <div className="md:col-span-2">
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
              Description *
            </label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Detailed description of the campaign, how funds will be used, and the impact it will make..."
              rows="4"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              required
              maxLength="1000"
            />
            <p className="text-sm text-gray-500 mt-1">{formData.description.length}/1000 characters</p>
          </div>

          {/* Target Amount */}
          <div>
            <label htmlFor="targetAmount" className="block text-sm font-medium text-gray-700 mb-2">
              Target Amount (ETH) *
            </label>
            <input
              type="number"
              id="targetAmount"
              name="targetAmount"
              value={formData.targetAmount}
              onChange={handleChange}
              placeholder="10.0"
              step="0.001"
              min="0"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
          </div>

          {/* Category */}
          <div>
            <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-2">
              Category
            </label>
            <select
              id="category"
              name="category"
              value={formData.category}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="disaster-relief">Disaster Relief</option>
              <option value="medical">Medical Emergency</option>
              <option value="education">Education</option>
              <option value="environment">Environment</option>
              <option value="other">Other</option>
            </select>
          </div>

          {/* Beneficiary Address */}
          <div className="md:col-span-2">
            <label htmlFor="beneficiary" className="block text-sm font-medium text-gray-700 mb-2">
              Beneficiary Address *
            </label>
            <input
              type="text"
              id="beneficiary"
              name="beneficiary"
              value={formData.beneficiary}
              onChange={handleChange}
              placeholder="0x742d35Cc6634C0532925a3b8D4C9db96590c6C87"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-sm"
              required
            />
            <p className="text-sm text-gray-500 mt-1">Ethereum address that will receive the funds when withdrawn</p>
          </div>

          {/* Location */}
          <div className="md:col-span-2">
            <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-2">
              Location (Optional)
            </label>
            <input
              type="text"
              id="location"
              name="location"
              value={formData.location}
              onChange={handleChange}
              placeholder="Bangladesh, Turkey, California USA, etc."
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex items-center justify-end space-x-4">
          <button
            type="button"
            onClick={() => {
              setFormData({
                title: "",
                description: "",
                targetAmount: "",
                beneficiary: "",
                category: "disaster-relief",
                location: "",
              })
            }}
            className="px-6 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
          >
            Reset
          </button>

          <button
            type="submit"
            disabled={isLoading}
            className={`px-6 py-2 rounded-md font-medium transition-colors ${
              isLoading ? "bg-gray-300 text-gray-500 cursor-not-allowed" : "bg-blue-600 text-white hover:bg-blue-700"
            }`}
          >
            {isLoading ? (
              <div className="flex items-center space-x-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                <span>Creating...</span>
              </div>
            ) : (
              "Create Campaign"
            )}
          </button>
        </div>
      </form>

      {/* Info Box */}
      <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="text-sm font-medium text-blue-800 mb-2">Important Notes:</h3>
        <ul className="text-sm text-blue-700 space-y-1">
          <li>• Campaign creation requires a blockchain transaction</li>
          <li>• Make sure the beneficiary address is correct - it cannot be changed later</li>
          <li>• Only you (as admin) can activate/deactivate campaigns</li>
          <li>• Funds can only be withdrawn to the specified beneficiary address</li>
        </ul>
      </div>
    </div>
  )
}

export default CreateCampaignForm
