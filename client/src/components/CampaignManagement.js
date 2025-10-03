"use client"

import { useState, useEffect } from "react"
import { toast } from "react-toastify"
import axios from "axios"

const CampaignManagement = ({ contract, onRefresh }) => {
  const [campaigns, setCampaigns] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [filter, setFilter] = useState("all")
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)

  const fetchCampaigns = async (page = 1, status = "all") => {
    try {
      setIsLoading(true)
      const response = await axios.get("/api/admin/campaigns", {
        params: {
          page,
          limit: 10,
          status: status === "all" ? undefined : status,
        },
      })

      setCampaigns(response.data.data.campaigns)
      setTotalPages(response.data.data.pagination.pages)
      setCurrentPage(response.data.data.pagination.current)
    } catch (error) {
      console.error("Error fetching campaigns:", error)
      toast.error("Failed to load campaigns")
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchCampaigns(currentPage, filter)
  }, [currentPage, filter])

  const toggleCampaignStatus = async (campaignId, currentStatus) => {
    try {
      // Toggle status on blockchain
      const tx = await contract.toggleCampaignStatus(campaignId)
      toast.info("Transaction submitted. Waiting for confirmation...")

      await tx.wait()

      // Update status in database
      await axios.put(`/api/admin/campaigns/${campaignId}/status`)

      toast.success(`Campaign ${currentStatus ? "deactivated" : "activated"} successfully`)

      // Refresh campaigns list
      fetchCampaigns(currentPage, filter)
      onRefresh()
    } catch (error) {
      console.error("Error toggling campaign status:", error)
      toast.error("Failed to update campaign status")
    }
  }

  const withdrawFunds = async (campaignId, totalRaised) => {
    if (Number.parseFloat(totalRaised) === 0) {
      toast.error("No funds to withdraw")
      return
    }

    try {
      const tx = await contract.withdrawFunds(campaignId)
      toast.info("Withdrawal transaction submitted. Waiting for confirmation...")

      await tx.wait()

      toast.success("Funds withdrawn successfully")

      // Refresh campaigns list
      fetchCampaigns(currentPage, filter)
      onRefresh()
    } catch (error) {
      console.error("Error withdrawing funds:", error)
      toast.error("Failed to withdraw funds")
    }
  }

  const formatAddress = (address) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`
  }

  const calculateProgress = (raised, target) => {
    return Math.min((Number.parseFloat(raised) / Number.parseFloat(target)) * 100, 100)
  }

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="animate-pulse space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-20 bg-gray-200 rounded"></div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <h2 className="text-xl font-semibold text-gray-800">Campaign Management</h2>

          <div className="flex items-center space-x-4">
            <select
              value={filter}
              onChange={(e) => {
                setFilter(e.target.value)
                setCurrentPage(1)
              }}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Campaigns</option>
              <option value="active">Active Only</option>
              <option value="inactive">Inactive Only</option>
            </select>

            <button
              onClick={() => fetchCampaigns(currentPage, filter)}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              Refresh
            </button>
          </div>
        </div>
      </div>

      {/* Campaigns List */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        {campaigns.length === 0 ? (
          <div className="p-8 text-center">
            <p className="text-gray-500">No campaigns found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Campaign
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Progress
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Stats
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {campaigns.map((campaign) => (
                  <tr key={campaign.campaignId}>
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <div className="text-sm font-medium text-gray-900">
                          #{campaign.campaignId} - {campaign.title}
                        </div>
                        <div className="text-sm text-gray-500 truncate max-w-xs">{campaign.description}</div>
                        <div className="text-xs text-gray-400 mt-1">
                          Beneficiary: {formatAddress(campaign.beneficiary)}
                        </div>
                      </div>
                    </td>

                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <div className="text-sm text-gray-900">
                          {campaign.stats.totalRaised.toFixed(4)} / {campaign.targetAmount} ETH
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                          <div
                            className="bg-blue-600 h-2 rounded-full"
                            style={{
                              width: `${calculateProgress(campaign.stats.totalRaised, campaign.targetAmount)}%`,
                            }}
                          ></div>
                        </div>
                        <div className="text-xs text-gray-500 mt-1">
                          {calculateProgress(campaign.stats.totalRaised, campaign.targetAmount).toFixed(1)}%
                        </div>
                      </div>
                    </td>

                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">
                        <div>{campaign.stats.donationCount} donations</div>
                        <div>{campaign.stats.uniqueDonors} unique donors</div>
                        <div className="text-xs text-gray-500 mt-1">
                          Created: {new Date(campaign.createdAt).toLocaleDateString()}
                        </div>
                      </div>
                    </td>

                    <td className="px-6 py-4">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${
                          campaign.isActive ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                        }`}
                      >
                        {campaign.isActive ? "Active" : "Inactive"}
                      </span>
                    </td>

                    <td className="px-6 py-4">
                      <div className="flex flex-col space-y-2">
                        <button
                          onClick={() => toggleCampaignStatus(campaign.campaignId, campaign.isActive)}
                          className={`px-3 py-1 rounded text-xs font-medium transition-colors ${
                            campaign.isActive
                              ? "bg-red-100 text-red-800 hover:bg-red-200"
                              : "bg-green-100 text-green-800 hover:bg-green-200"
                          }`}
                        >
                          {campaign.isActive ? "Deactivate" : "Activate"}
                        </button>

                        {campaign.stats.totalRaised > 0 && (
                          <button
                            onClick={() => withdrawFunds(campaign.campaignId, campaign.stats.totalRaised)}
                            className="px-3 py-1 bg-blue-100 text-blue-800 hover:bg-blue-200 rounded text-xs font-medium transition-colors"
                          >
                            Withdraw Funds
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="bg-white rounded-lg shadow-md p-4">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-700">
              Page {currentPage} of {totalPages}
            </div>

            <div className="flex items-center space-x-2">
              <button
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className="px-3 py-1 border border-gray-300 rounded-md text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
              >
                Previous
              </button>

              <button
                onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
                className="px-3 py-1 border border-gray-300 rounded-md text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
              >
                Next
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default CampaignManagement
