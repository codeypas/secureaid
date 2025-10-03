"use client"

import { useState, useEffect } from "react"
import { useWeb3 } from "../contexts/Web3Context"
import CampaignCard from "../components/CampaignCard"
import { ethers } from "ethers"

const HomePage = () => {
  const { contract, isConnected } = useWeb3()
  const [activeCampaigns, setActiveCampaigns] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [totalFunds, setTotalFunds] = useState("0")

  const fetchData = async () => {
    if (!contract) return

    try {
      setIsLoading(true)

      const campaigns = await contract.getActiveCampaigns()
      const total = await contract.getTotalFunds()

      setActiveCampaigns(campaigns.map((id) => Number(id)))
      setTotalFunds(ethers.formatEther(total))
    } catch (error) {
      console.error("Error fetching data:", error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [contract])

  if (!isConnected) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">Connect Your Wallet</h2>
          <p className="text-gray-600 mb-6">Please connect your MetaMask wallet to view and donate to campaigns</p>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm text-blue-800">
              Make sure you have MetaMask installed and are connected to the correct network
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Blockchain-Powered Disaster Relief</h1>
          <p className="text-xl text-gray-600 mb-6">
            Transparent, secure, and instant donations for emergency relief efforts
          </p>
          <div className="bg-white rounded-lg shadow-md p-6 inline-block">
            <p className="text-sm text-gray-600 mb-2">Total Funds Raised</p>
            <p className="text-3xl font-bold text-blue-600">{totalFunds} ETH</p>
          </div>
        </div>

        {/* Features */}
        <div className="grid md:grid-cols-3 gap-6 mb-12">
          <div className="bg-white rounded-lg shadow-md p-6 text-center">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-4">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-800 mb-2">Secure</h3>
            <p className="text-gray-600">Smart contracts ensure your donations are safe and tamper-proof</p>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6 text-center">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-4">
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-800 mb-2">Transparent</h3>
            <p className="text-gray-600">Every transaction is recorded on the blockchain for full transparency</p>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6 text-center">
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-4">
              <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-800 mb-2">Instant</h3>
            <p className="text-gray-600">Donations are processed immediately without intermediaries</p>
          </div>
        </div>

        {/* Active Campaigns */}
        <div>
          <h2 className="text-2xl font-semibold text-gray-800 mb-6">Active Campaigns</h2>

          {isLoading ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <div key={i} className="bg-white rounded-lg shadow-md p-6 animate-pulse">
                  <div className="h-6 bg-gray-200 rounded mb-4"></div>
                  <div className="h-4 bg-gray-200 rounded mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded mb-4"></div>
                  <div className="h-8 bg-gray-200 rounded"></div>
                </div>
              ))}
            </div>
          ) : activeCampaigns.length > 0 ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {activeCampaigns.map((campaignId) => (
                <CampaignCard key={campaignId} campaignId={campaignId} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg">No active campaigns at the moment</p>
              <p className="text-gray-400 mt-2">Check back later for new relief efforts</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default HomePage
