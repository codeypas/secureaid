"use client"

import { useState, useEffect } from "react"
import { useWeb3 } from "../contexts/Web3Context"
import { ethers } from "ethers"
import DonationForm from "./DonationForm"

const CampaignCard = ({ campaignId }) => {
  const { contract } = useWeb3()
  const [campaign, setCampaign] = useState(null)
  const [donations, setDonations] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [showDonationForm, setShowDonationForm] = useState(false)

  const fetchCampaignData = async () => {
    if (!contract) return

    try {
      setIsLoading(true)

      const campaignData = await contract.getCampaignDetails(campaignId)
      const campaignDonations = await contract.getCampaignDonations(campaignId)

      setCampaign({
        title: campaignData.title,
        description: campaignData.description,
        targetAmount: ethers.formatEther(campaignData.targetAmount),
        totalRaised: ethers.formatEther(campaignData.totalRaised),
        createdAt: new Date(Number(campaignData.createdAt) * 1000),
        isActive: campaignData.isActive,
        beneficiary: campaignData.beneficiary,
      })

      setDonations(
        campaignDonations.map((donation) => ({
          donor: donation.donor,
          amount: ethers.formatEther(donation.amount),
          timestamp: new Date(Number(donation.timestamp) * 1000),
          message: donation.message,
        })),
      )
    } catch (error) {
      console.error("Error fetching campaign data:", error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchCampaignData()
  }, [contract, campaignId])

  const calculateProgress = () => {
    if (!campaign) return 0
    return Math.min((Number.parseFloat(campaign.totalRaised) / Number.parseFloat(campaign.targetAmount)) * 100, 100)
  }

  const formatAddress = (address) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`
  }

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6 animate-pulse">
        <div className="h-6 bg-gray-200 rounded mb-4"></div>
        <div className="h-4 bg-gray-200 rounded mb-2"></div>
        <div className="h-4 bg-gray-200 rounded mb-4"></div>
        <div className="h-8 bg-gray-200 rounded"></div>
      </div>
    )
  }

  if (!campaign) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <p className="text-gray-500">Campaign not found</p>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <div className="p-6">
        <div className="flex justify-between items-start mb-4">
          <h2 className="text-xl font-semibold text-gray-800">{campaign.title}</h2>
          <span
            className={`px-2 py-1 rounded-full text-xs font-medium ${
              campaign.isActive ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
            }`}
          >
            {campaign.isActive ? "Active" : "Inactive"}
          </span>
        </div>

        <p className="text-gray-600 mb-4">{campaign.description}</p>

        <div className="mb-4">
          <div className="flex justify-between text-sm text-gray-600 mb-2">
            <span>Progress</span>
            <span>{calculateProgress().toFixed(1)}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${calculateProgress()}%` }}
            ></div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <p className="text-sm text-gray-600">Raised</p>
            <p className="text-lg font-semibold text-gray-800">{campaign.totalRaised} ETH</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Target</p>
            <p className="text-lg font-semibold text-gray-800">{campaign.targetAmount} ETH</p>
          </div>
        </div>

        <div className="mb-4">
          <p className="text-sm text-gray-600">Beneficiary</p>
          <p className="text-sm font-mono text-gray-800">{formatAddress(campaign.beneficiary)}</p>
        </div>

        <div className="mb-4">
          <p className="text-sm text-gray-600">Created</p>
          <p className="text-sm text-gray-800">{campaign.createdAt.toLocaleDateString()}</p>
        </div>

        {campaign.isActive && (
          <button
            onClick={() => setShowDonationForm(!showDonationForm)}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors font-medium"
          >
            {showDonationForm ? "Hide Donation Form" : "Donate Now"}
          </button>
        )}
      </div>

      {showDonationForm && campaign.isActive && (
        <div className="border-t p-6">
          <DonationForm campaignId={campaignId} onDonationSuccess={fetchCampaignData} />
        </div>
      )}

      {donations.length > 0 && (
        <div className="border-t p-6">
          <h3 className="text-lg font-semibold mb-4 text-gray-800">Recent Donations</h3>
          <div className="space-y-3 max-h-60 overflow-y-auto">
            {donations
              .slice(-5)
              .reverse()
              .map((donation, index) => (
                <div key={index} className="bg-gray-50 rounded-lg p-3">
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-sm font-mono text-gray-600">{formatAddress(donation.donor)}</span>
                    <span className="text-sm font-semibold text-gray-800">{donation.amount} ETH</span>
                  </div>
                  {donation.message && <p className="text-sm text-gray-600 italic">"{donation.message}"</p>}
                  <p className="text-xs text-gray-500 mt-1">{donation.timestamp.toLocaleString()}</p>
                </div>
              ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default CampaignCard
