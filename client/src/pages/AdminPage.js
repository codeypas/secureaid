"use client"

import { useState, useEffect } from "react"
import { useWeb3 } from "../contexts/Web3Context"
import { toast } from "react-toastify"
import axios from "axios"
import AdminStats from "../components/AdminStats"
import CampaignManagement from "../components/CampaignManagement"
import CreateCampaignForm from "../components/CreateCampaignForm"
import DonationAnalytics from "../components/DonationAnalytics"

const AdminPage = () => {
  const { account, contract, isConnected } = useWeb3()
  const [activeTab, setActiveTab] = useState("dashboard")
  const [isAdmin, setIsAdmin] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [dashboardData, setDashboardData] = useState(null)

  // Check if current user is admin
  const checkAdminStatus = async () => {
    if (!account || !contract) return

    try {
      // Check if user is the contract owner
      const owner = await contract.owner()
      setIsAdmin(account.toLowerCase() === owner.toLowerCase())
    } catch (error) {
      console.error("Error checking admin status:", error)
      setIsAdmin(false)
    } finally {
      setIsLoading(false)
    }
  }

  // Fetch dashboard data
  const fetchDashboardData = async () => {
    try {
      const response = await axios.get("/api/admin/dashboard")
      setDashboardData(response.data.data)
    } catch (error) {
      console.error("Error fetching dashboard data:", error)
      toast.error("Failed to load dashboard data")
    }
  }

  useEffect(() => {
    checkAdminStatus()
  }, [account, contract])

  useEffect(() => {
    if (isAdmin) {
      fetchDashboardData()
    }
  }, [isAdmin])

  if (!isConnected) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">Admin Access Required</h2>
          <p className="text-gray-600 mb-6">Please connect your wallet to access the admin dashboard</p>
        </div>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex items-center space-x-2">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="text-gray-600">Checking admin permissions...</span>
        </div>
      </div>
    )
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
              />
            </svg>
          </div>
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">Access Denied</h2>
          <p className="text-gray-600 mb-6">You don't have admin permissions to access this dashboard</p>
          <p className="text-sm text-gray-500">Connected as: {account}</p>
        </div>
      </div>
    )
  }

  const tabs = [
    { id: "dashboard", name: "Dashboard", icon: "📊" },
    { id: "campaigns", name: "Campaigns", icon: "🎯" },
    { id: "create", name: "Create Campaign", icon: "➕" },
    { id: "analytics", name: "Analytics", icon: "📈" },
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Admin Dashboard</h1>
          <p className="text-gray-600">Manage campaigns and monitor fundraising activities</p>
        </div>

        {/* Navigation Tabs */}
        <div className="border-b border-gray-200 mb-8">
          <nav className="-mb-px flex space-x-8">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                <span className="mr-2">{tab.icon}</span>
                {tab.name}
              </button>
            ))}
          </nav>
        </div>

        {/* Tab Content */}
        <div className="tab-content">
          {activeTab === "dashboard" && <AdminStats data={dashboardData} onRefresh={fetchDashboardData} />}

          {activeTab === "campaigns" && <CampaignManagement contract={contract} onRefresh={fetchDashboardData} />}

          {activeTab === "create" && (
            <CreateCampaignForm
              contract={contract}
              onSuccess={() => {
                fetchDashboardData()
                setActiveTab("campaigns")
              }}
            />
          )}

          {activeTab === "analytics" && <DonationAnalytics />}
        </div>
      </div>
    </div>
  )
}

export default AdminPage
