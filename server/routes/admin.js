const express = require("express")
const { body, param, validationResult } = require("express-validator")
const Campaign = require("../models/Campaign")
const Donation = require("../models/Donation")
const Admin = require("../models/Admin")
const router = express.Router()

// Validation middleware
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: "Validation errors",
      errors: errors.array(),
    })
  }
  next()
}

// GET /api/admin/dashboard - Get admin dashboard data
router.get("/dashboard", async (req, res) => {
  try {
    // Get overall statistics
    const [campaignStats, donationStats] = await Promise.all([
      Campaign.aggregate([
        {
          $group: {
            _id: null,
            totalCampaigns: { $sum: 1 },
            activeCampaigns: { $sum: { $cond: ["$isActive", 1, 0] } },
            totalTargetAmount: { $sum: { $toDouble: "$targetAmount" } },
          },
        },
      ]),
      Donation.aggregate([
        {
          $group: {
            _id: null,
            totalDonations: { $sum: 1 },
            totalAmount: { $sum: { $toDouble: "$amount" } },
            uniqueDonors: { $addToSet: "$donor" },
          },
        },
        {
          $project: {
            totalDonations: 1,
            totalAmount: 1,
            uniqueDonors: { $size: "$uniqueDonors" },
          },
        },
      ]),
    ])

    // Get recent activity
    const recentCampaigns = await Campaign.find().sort({ createdAt: -1 }).limit(5).lean()

    const recentDonations = await Donation.find().sort({ timestamp: -1 }).limit(10).lean()

    // Get campaign performance
    const campaignPerformance = await Donation.aggregate([
      {
        $group: {
          _id: "$campaignId",
          totalRaised: { $sum: { $toDouble: "$amount" } },
          donationCount: { $sum: 1 },
          uniqueDonors: { $addToSet: "$donor" },
        },
      },
      {
        $project: {
          campaignId: "$_id",
          totalRaised: 1,
          donationCount: 1,
          uniqueDonors: { $size: "$uniqueDonors" },
        },
      },
      { $sort: { totalRaised: -1 } },
      { $limit: 10 },
    ])

    res.json({
      success: true,
      data: {
        overview: {
          campaigns: campaignStats[0] || { totalCampaigns: 0, activeCampaigns: 0, totalTargetAmount: 0 },
          donations: donationStats[0] || { totalDonations: 0, totalAmount: 0, uniqueDonors: 0 },
        },
        recentActivity: {
          campaigns: recentCampaigns,
          donations: recentDonations,
        },
        campaignPerformance,
      },
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching dashboard data",
      error: error.message,
    })
  }
})

// GET /api/admin/campaigns - Get all campaigns for admin
router.get("/campaigns", async (req, res) => {
  try {
    const page = Number.parseInt(req.query.page) || 1
    const limit = Number.parseInt(req.query.limit) || 20
    const skip = (page - 1) * limit
    const status = req.query.status // 'active', 'inactive', 'all'

    const query = {}
    if (status === "active") query.isActive = true
    if (status === "inactive") query.isActive = false

    const campaigns = await Campaign.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit).lean()

    // Get donation stats for each campaign
    const campaignsWithStats = await Promise.all(
      campaigns.map(async (campaign) => {
        const donationStats = await Donation.aggregate([
          { $match: { campaignId: campaign.campaignId } },
          {
            $group: {
              _id: null,
              totalRaised: { $sum: { $toDouble: "$amount" } },
              donationCount: { $sum: 1 },
              uniqueDonors: { $addToSet: "$donor" },
            },
          },
          {
            $project: {
              totalRaised: 1,
              donationCount: 1,
              uniqueDonors: { $size: "$uniqueDonors" },
            },
          },
        ])

        return {
          ...campaign,
          stats: donationStats[0] || { totalRaised: 0, donationCount: 0, uniqueDonors: 0 },
        }
      }),
    )

    const total = await Campaign.countDocuments(query)

    res.json({
      success: true,
      data: {
        campaigns: campaignsWithStats,
        pagination: {
          current: page,
          pages: Math.ceil(total / limit),
          total,
          hasNext: page < Math.ceil(total / limit),
          hasPrev: page > 1,
        },
      },
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching campaigns",
      error: error.message,
    })
  }
})

// PUT /api/admin/campaigns/:id/status - Toggle campaign status
router.put(
  "/campaigns/:id/status",
  [param("id").isNumeric().withMessage("Campaign ID must be a number")],
  handleValidationErrors,
  async (req, res) => {
    try {
      const campaignId = Number.parseInt(req.params.id)

      const campaign = await Campaign.findOne({ campaignId })
      if (!campaign) {
        return res.status(404).json({
          success: false,
          message: "Campaign not found",
        })
      }

      campaign.isActive = !campaign.isActive
      await campaign.save()

      res.json({
        success: true,
        message: `Campaign ${campaign.isActive ? "activated" : "deactivated"} successfully`,
        data: campaign,
      })
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Error updating campaign status",
        error: error.message,
      })
    }
  },
)

// GET /api/admin/analytics - Get detailed analytics
router.get("/analytics", async (req, res) => {
  try {
    const timeframe = req.query.timeframe || "30d" // 7d, 30d, 90d, 1y

    let dateFilter = {}
    const now = new Date()

    switch (timeframe) {
      case "7d":
        dateFilter = { $gte: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000) }
        break
      case "30d":
        dateFilter = { $gte: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000) }
        break
      case "90d":
        dateFilter = { $gte: new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000) }
        break
      case "1y":
        dateFilter = { $gte: new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000) }
        break
    }

    // Donation trends over time
    const donationTrends = await Donation.aggregate([
      { $match: { timestamp: dateFilter } },
      {
        $group: {
          _id: {
            year: { $year: "$timestamp" },
            month: { $month: "$timestamp" },
            day: { $dayOfMonth: "$timestamp" },
          },
          totalAmount: { $sum: { $toDouble: "$amount" } },
          donationCount: { $sum: 1 },
        },
      },
      { $sort: { "_id.year": 1, "_id.month": 1, "_id.day": 1 } },
    ])

    // Top donors
    const topDonors = await Donation.aggregate([
      { $match: { timestamp: dateFilter } },
      {
        $group: {
          _id: "$donor",
          totalAmount: { $sum: { $toDouble: "$amount" } },
          donationCount: { $sum: 1 },
        },
      },
      { $sort: { totalAmount: -1 } },
      { $limit: 10 },
    ])

    // Campaign categories performance
    const categoryPerformance = await Campaign.aggregate([
      {
        $lookup: {
          from: "donations",
          localField: "campaignId",
          foreignField: "campaignId",
          as: "donations",
        },
      },
      {
        $group: {
          _id: "$category",
          campaignCount: { $sum: 1 },
          totalRaised: {
            $sum: {
              $sum: {
                $map: {
                  input: "$donations",
                  as: "donation",
                  in: { $toDouble: "$$donation.amount" },
                },
              },
            },
          },
        },
      },
      { $sort: { totalRaised: -1 } },
    ])

    res.json({
      success: true,
      data: {
        timeframe,
        donationTrends,
        topDonors,
        categoryPerformance,
      },
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching analytics data",
      error: error.message,
    })
  }
})

module.exports = router
