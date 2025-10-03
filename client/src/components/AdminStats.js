"use client"

const AdminStats = ({ data, onRefresh }) => {
  if (!data) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="bg-white rounded-lg shadow-md p-6 animate-pulse">
            <div className="h-4 bg-gray-200 rounded mb-2"></div>
            <div className="h-8 bg-gray-200 rounded"></div>
          </div>
        ))}
      </div>
    )
  }

  const { overview, recentActivity, campaignPerformance } = data

  const stats = [
    {
      title: "Total Campaigns",
      value: overview.campaigns.totalCampaigns,
      subtitle: `${overview.campaigns.activeCampaigns} active`,
      icon: "🎯",
      color: "blue",
    },
    {
      title: "Total Donations",
      value: overview.donations.totalDonations,
      subtitle: `${overview.donations.uniqueDonors} unique donors`,
      icon: "💝",
      color: "green",
    },
    {
      title: "Total Raised",
      value: `${overview.donations.totalAmount.toFixed(4)} ETH`,
      subtitle: `Target: ${overview.campaigns.totalTargetAmount.toFixed(2)} ETH`,
      icon: "💰",
      color: "purple",
    },
    {
      title: "Success Rate",
      value: `${((overview.donations.totalAmount / overview.campaigns.totalTargetAmount) * 100).toFixed(1)}%`,
      subtitle: "Of total target",
      icon: "📈",
      color: "orange",
    },
  ]

  const getColorClasses = (color) => {
    const colors = {
      blue: "bg-blue-100 text-blue-800",
      green: "bg-green-100 text-green-800",
      purple: "bg-purple-100 text-purple-800",
      orange: "bg-orange-100 text-orange-800",
    }
    return colors[color] || colors.blue
  }

  return (
    <div className="space-y-8">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <div key={index} className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between mb-4">
              <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${getColorClasses(stat.color)}`}>
                <span className="text-2xl">{stat.icon}</span>
              </div>
              <button
                onClick={onRefresh}
                className="text-gray-400 hover:text-gray-600 transition-colors"
                title="Refresh data"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                  />
                </svg>
              </button>
            </div>
            <h3 className="text-sm font-medium text-gray-600 mb-1">{stat.title}</h3>
            <p className="text-2xl font-bold text-gray-900 mb-1">{stat.value}</p>
            <p className="text-sm text-gray-500">{stat.subtitle}</p>
          </div>
        ))}
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Campaigns */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Recent Campaigns</h3>
          <div className="space-y-4">
            {recentActivity.campaigns.slice(0, 5).map((campaign, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex-1">
                  <h4 className="font-medium text-gray-800 truncate">{campaign.title}</h4>
                  <p className="text-sm text-gray-600">Target: {campaign.targetAmount} ETH</p>
                </div>
                <div className="text-right">
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-medium ${
                      campaign.isActive ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                    }`}
                  >
                    {campaign.isActive ? "Active" : "Inactive"}
                  </span>
                  <p className="text-xs text-gray-500 mt-1">{new Date(campaign.createdAt).toLocaleDateString()}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Donations */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Recent Donations</h3>
          <div className="space-y-4">
            {recentActivity.donations.slice(0, 5).map((donation, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex-1">
                  <h4 className="font-medium text-gray-800">Campaign #{donation.campaignId}</h4>
                  <p className="text-sm text-gray-600 font-mono">
                    {`${donation.donor.slice(0, 6)}...${donation.donor.slice(-4)}`}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-gray-800">{donation.amount} ETH</p>
                  <p className="text-xs text-gray-500">{new Date(donation.timestamp).toLocaleDateString()}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Top Performing Campaigns */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Top Performing Campaigns</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Campaign ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Total Raised
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Donations
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Unique Donors
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {campaignPerformance.slice(0, 5).map((campaign, index) => (
                <tr key={index}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    #{campaign.campaignId}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {campaign.totalRaised.toFixed(4)} ETH
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{campaign.donationCount}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{campaign.uniqueDonors}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

export default AdminStats
