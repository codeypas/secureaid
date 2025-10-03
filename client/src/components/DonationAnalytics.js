"use client"

import { useState, useEffect } from "react"
import axios from "axios"
import { toast } from "react-toastify"

const DonationAnalytics = () => {
  const [analyticsData, setAnalyticsData] = useState(null)
  const [timeframe, setTimeframe] = useState("30d")
  const [isLoading, setIsLoading] = useState(true)

  const fetchAnalytics = async (selectedTimeframe) => {
    try {
      setIsLoading(true)
      const response = await axios.get("/api/admin/analytics", {
        params: { timeframe: selectedTimeframe },
      })
      setAnalyticsData(response.data.data)
    } catch (error) {
      console.error("Error fetching analytics:", error)
      toast.error("Failed to load analytics data")
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchAnalytics(timeframe)
  }, [timeframe])

  const formatAddress = (address) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`
  }

  const formatDate = (dateObj) => {
    return `${dateObj.year}-${String(dateObj.month).padStart(2, "0")}-${String(dateObj.day).padStart(2, "0")}`
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-white rounded-lg shadow-md p-6 animate-pulse">
            <div className="h-6 bg-gray-200 rounded mb-4"></div>
            <div className="h-32 bg-gray-200 rounded"></div>
          </div>
        ))}
      </div>
    )
  }

  if (!analyticsData) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <p className="text-gray-500">No analytics data available</p>
      </div>
    )
  }

  const { donationTrends, topDonors, categoryPerformance } = analyticsData

  return (
    <div className="space-y-6">
      {/* Header with Timeframe Selector */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <h2 className="text-xl font-semibold text-gray-800">Donation Analytics</h2>

          <div className="flex items-center space-x-4">
            <label className="text-sm font-medium text-gray-700">Timeframe:</label>
            <select
              value={timeframe}
              onChange={(e) => setTimeframe(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="7d">Last 7 Days</option>
              <option value="30d">Last 30 Days</option>
              <option value="90d">Last 90 Days</option>
              <option value="1y">Last Year</option>
            </select>
          </div>
        </div>
      </div>

      {/* Donation Trends */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Donation Trends</h3>

        {donationTrends.length === 0 ? (
          <p className="text-gray-500">No donation data for the selected timeframe</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Total Amount (ETH)
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Donation Count
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Average (ETH)
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {donationTrends.map((trend, index) => (
                  <tr key={index}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {formatDate(trend._id)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {trend.totalAmount.toFixed(4)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{trend.donationCount}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {(trend.totalAmount / trend.donationCount).toFixed(4)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Top Donors and Category Performance */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Donors */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Top Donors</h3>

          {topDonors.length === 0 ? (
            <p className="text-gray-500">No donor data for the selected timeframe</p>
          ) : (
            <div className="space-y-4">
              {topDonors.map((donor, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                      <span className="text-sm font-medium text-blue-800">#{index + 1}</span>
                    </div>
                    <div>
                      <p className="font-medium text-gray-800 font-mono text-sm">{formatAddress(donor._id)}</p>
                      <p className="text-sm text-gray-600">{donor.donationCount} donations</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-gray-800">{donor.totalAmount.toFixed(4)} ETH</p>
                    <p className="text-sm text-gray-600">
                      Avg: {(donor.totalAmount / donor.donationCount).toFixed(4)} ETH
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Category Performance */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Category Performance</h3>

          {categoryPerformance.length === 0 ? (
            <p className="text-gray-500">No category data available</p>
          ) : (
            <div className="space-y-4">
              {categoryPerformance.map((category, index) => (
                <div key={index} className="p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium text-gray-800 capitalize">{category._id.replace("-", " ")}</h4>
                    <span className="text-sm text-gray-600">{category.campaignCount} campaigns</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-blue-600 h-2 rounded-full"
                          style={{
                            width: `${Math.min((category.totalRaised / Math.max(...categoryPerformance.map((c) => c.totalRaised))) * 100, 100)}%`,
                          }}
                        ></div>
                      </div>
                    </div>
                    <div className="ml-4 text-right">
                      <p className="font-semibold text-gray-800">{category.totalRaised.toFixed(4)} ETH</p>
                      <p className="text-sm text-gray-600">
                        Avg: {(category.totalRaised / category.campaignCount).toFixed(4)} ETH
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Summary Stats */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Summary Statistics</h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <p className="text-2xl font-bold text-blue-600">
              {donationTrends.reduce((sum, trend) => sum + trend.totalAmount, 0).toFixed(4)}
            </p>
            <p className="text-sm text-gray-600">Total ETH Raised</p>
          </div>

          <div className="text-center">
            <p className="text-2xl font-bold text-green-600">
              {donationTrends.reduce((sum, trend) => sum + trend.donationCount, 0)}
            </p>
            <p className="text-sm text-gray-600">Total Donations</p>
          </div>

          <div className="text-center">
            <p className="text-2xl font-bold text-purple-600">{topDonors.length}</p>
            <p className="text-sm text-gray-600">Unique Donors</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default DonationAnalytics
