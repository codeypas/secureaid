const express = require("express")
const { body, param, query, validationResult } = require("express-validator")
const Donation = require("../models/Donation")
const Campaign = require("../models/Campaign")
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

// GET /api/donations - Get all donations with pagination and filters
router.get(
  "/",
  [
    query("page").optional().isInt({ min: 1 }).withMessage("Page must be a positive integer"),
    query("limit").optional().isInt({ min: 1, max: 100 }).withMessage("Limit must be between 1 and 100"),
    query("campaignId").optional().isNumeric().withMessage("Campaign ID must be a number"),
  ],
  handleValidationErrors,
  async (req, res) => {
    try {
      const page = Number.parseInt(req.query.page) || 1
      const limit = Number.parseInt(req.query.limit) || 20
      const skip = (page - 1) * limit
      const campaignId = req.query.campaignId
      const donor = req.query.donor

      // Build query
      const query = {}
      if (campaignId) query.campaignId = Number.parseInt(campaignId)
      if (donor) query.donor = donor.toLowerCase()

      const donations = await Donation.find(query).sort({ timestamp: -1 }).skip(skip).limit(limit).lean()

      const total = await Donation.countDocuments(query)

      res.json({
        success: true,
        data: {
          donations,
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
        message: "Error fetching donations",
        error: error.message,
      })
    }
  },
)

// GET /api/donations/campaign/:campaignId - Get donations for specific campaign
router.get(
  "/campaign/:campaignId",
  [
    param("campaignId").isNumeric().withMessage("Campaign ID must be a number"),
    query("page").optional().isInt({ min: 1 }),
    query("limit").optional().isInt({ min: 1, max: 100 }),
  ],
  handleValidationErrors,
  async (req, res) => {
    try {
      const campaignId = Number.parseInt(req.params.campaignId)
      const page = Number.parseInt(req.query.page) || 1
      const limit = Number.parseInt(req.query.limit) || 20
      const skip = (page - 1) * limit

      const donations = await Donation.find({ campaignId }).sort({ timestamp: -1 }).skip(skip).limit(limit).lean()

      const total = await Donation.countDocuments({ campaignId })

      // Calculate statistics
      const stats = await Donation.aggregate([
        { $match: { campaignId } },
        {
          $group: {
            _id: null,
            totalAmount: { $sum: { $toDouble: "$amount" } },
            totalDonations: { $sum: 1 },
            uniqueDonors: { $addToSet: "$donor" },
          },
        },
        {
          $project: {
            totalAmount: 1,
            totalDonations: 1,
            uniqueDonors: { $size: "$uniqueDonors" },
          },
        },
      ])

      res.json({
        success: true,
        data: {
          donations,
          statistics: stats[0] || { totalAmount: 0, totalDonations: 0, uniqueDonors: 0 },
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
        message: "Error fetching campaign donations",
        error: error.message,
      })
    }
  },
)

// POST /api/donations - Record new donation
router.post(
  "/",
  [
    body("campaignId").isNumeric().withMessage("Campaign ID must be a number"),
    body("transactionHash").isLength({ min: 66, max: 66 }).withMessage("Invalid transaction hash"),
    body("donor").isEthereumAddress().withMessage("Invalid donor address"),
    body("amount").notEmpty().withMessage("Amount is required"),
    body("timestamp").isISO8601().withMessage("Invalid timestamp"),
    body("message").optional().trim().isLength({ max: 500 }).withMessage("Message too long"),
  ],
  handleValidationErrors,
  async (req, res) => {
    try {
      const donationData = {
        campaignId: req.body.campaignId,
        transactionHash: req.body.transactionHash.toLowerCase(),
        donor: req.body.donor.toLowerCase(),
        amount: req.body.amount,
        message: req.body.message || "",
        blockNumber: req.body.blockNumber,
        gasUsed: req.body.gasUsed,
        gasPrice: req.body.gasPrice,
        timestamp: new Date(req.body.timestamp),
        isAnonymous: req.body.isAnonymous || false,
        donorEmail: req.body.donorEmail,
        donorName: req.body.donorName,
      }

      // Check if donation already exists
      const existingDonation = await Donation.findOne({
        transactionHash: donationData.transactionHash,
      })

      if (existingDonation) {
        return res.status(400).json({
          success: false,
          message: "Donation already recorded",
        })
      }

      // Verify campaign exists
      const campaign = await Campaign.findOne({ campaignId: donationData.campaignId })
      if (!campaign) {
        return res.status(404).json({
          success: false,
          message: "Campaign not found",
        })
      }

      const donation = new Donation(donationData)
      await donation.save()

      res.status(201).json({
        success: true,
        message: "Donation recorded successfully",
        data: donation,
      })
    } catch (error) {
      if (error.code === 11000) {
        return res.status(400).json({
          success: false,
          message: "Donation with this transaction hash already exists",
        })
      }
      res.status(500).json({
        success: false,
        message: "Error recording donation",
        error: error.message,
      })
    }
  },
)

// GET /api/donations/stats - Get donation statistics
router.get("/stats", async (req, res) => {
  try {
    const stats = await Donation.aggregate([
      {
        $group: {
          _id: null,
          totalAmount: { $sum: { $toDouble: "$amount" } },
          totalDonations: { $sum: 1 },
          uniqueDonors: { $addToSet: "$donor" },
          uniqueCampaigns: { $addToSet: "$campaignId" },
        },
      },
      {
        $project: {
          totalAmount: 1,
          totalDonations: 1,
          uniqueDonors: { $size: "$uniqueDonors" },
          uniqueCampaigns: { $size: "$uniqueCampaigns" },
        },
      },
    ])

    // Get top campaigns by donation amount
    const topCampaigns = await Donation.aggregate([
      {
        $group: {
          _id: "$campaignId",
          totalAmount: { $sum: { $toDouble: "$amount" } },
          donationCount: { $sum: 1 },
        },
      },
      { $sort: { totalAmount: -1 } },
      { $limit: 5 },
    ])

    // Get recent donations
    const recentDonations = await Donation.find().sort({ timestamp: -1 }).limit(10).lean()

    res.json({
      success: true,
      data: {
        overall: stats[0] || { totalAmount: 0, totalDonations: 0, uniqueDonors: 0, uniqueCampaigns: 0 },
        topCampaigns,
        recentDonations,
      },
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching donation statistics",
      error: error.message,
    })
  }
})

module.exports = router
