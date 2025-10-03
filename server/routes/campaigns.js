const express = require("express")
const { body, param, validationResult } = require("express-validator")
const Campaign = require("../models/Campaign")
const Donation = require("../models/Donation")
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

// GET /api/campaigns - Get all campaigns with pagination
router.get("/", async (req, res) => {
  try {
    const page = Number.parseInt(req.query.page) || 1
    const limit = Number.parseInt(req.query.limit) || 10
    const skip = (page - 1) * limit
    const category = req.query.category
    const isActive = req.query.active

    // Build query
    const query = {}
    if (category) query.category = category
    if (isActive !== undefined) query.isActive = isActive === "true"

    const campaigns = await Campaign.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit).lean()

    const total = await Campaign.countDocuments(query)

    res.json({
      success: true,
      data: {
        campaigns,
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

// GET /api/campaigns/:id - Get single campaign
router.get(
  "/:id",
  [param("id").isNumeric().withMessage("Campaign ID must be a number")],
  handleValidationErrors,
  async (req, res) => {
    try {
      const campaignId = Number.parseInt(req.params.id)
      const campaign = await Campaign.findOne({ campaignId }).lean()

      if (!campaign) {
        return res.status(404).json({
          success: false,
          message: "Campaign not found",
        })
      }

      // Get recent donations for this campaign
      const recentDonations = await Donation.find({ campaignId }).sort({ timestamp: -1 }).limit(10).lean()

      res.json({
        success: true,
        data: {
          campaign,
          recentDonations,
        },
      })
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Error fetching campaign",
        error: error.message,
      })
    }
  },
)

// POST /api/campaigns - Create new campaign (admin only)
router.post(
  "/",
  [
    body("campaignId").isNumeric().withMessage("Campaign ID must be a number"),
    body("title").trim().isLength({ min: 1, max: 200 }).withMessage("Title must be 1-200 characters"),
    body("description").trim().isLength({ min: 1, max: 1000 }).withMessage("Description must be 1-1000 characters"),
    body("targetAmount").notEmpty().withMessage("Target amount is required"),
    body("beneficiary").isEthereumAddress().withMessage("Invalid beneficiary address"),
    body("category").optional().isIn(["disaster-relief", "medical", "education", "environment", "other"]),
  ],
  handleValidationErrors,
  async (req, res) => {
    try {
      const campaignData = {
        campaignId: req.body.campaignId,
        title: req.body.title,
        description: req.body.description,
        targetAmount: req.body.targetAmount,
        beneficiary: req.body.beneficiary.toLowerCase(),
        category: req.body.category || "disaster-relief",
        location: req.body.location,
        images: req.body.images || [],
      }

      const campaign = new Campaign(campaignData)
      await campaign.save()

      res.status(201).json({
        success: true,
        message: "Campaign created successfully",
        data: campaign,
      })
    } catch (error) {
      if (error.code === 11000) {
        return res.status(400).json({
          success: false,
          message: "Campaign with this ID already exists",
        })
      }
      res.status(500).json({
        success: false,
        message: "Error creating campaign",
        error: error.message,
      })
    }
  },
)

// PUT /api/campaigns/:id - Update campaign
router.put(
  "/:id",
  [
    param("id").isNumeric().withMessage("Campaign ID must be a number"),
    body("title").optional().trim().isLength({ min: 1, max: 200 }),
    body("description").optional().trim().isLength({ min: 1, max: 1000 }),
    body("location").optional().trim(),
    body("category").optional().isIn(["disaster-relief", "medical", "education", "environment", "other"]),
  ],
  handleValidationErrors,
  async (req, res) => {
    try {
      const campaignId = Number.parseInt(req.params.id)
      const updateData = {}

      // Only update allowed fields
      const allowedFields = ["title", "description", "location", "category", "images"]
      allowedFields.forEach((field) => {
        if (req.body[field] !== undefined) {
          updateData[field] = req.body[field]
        }
      })

      const campaign = await Campaign.findOneAndUpdate({ campaignId }, updateData, { new: true, runValidators: true })

      if (!campaign) {
        return res.status(404).json({
          success: false,
          message: "Campaign not found",
        })
      }

      res.json({
        success: true,
        message: "Campaign updated successfully",
        data: campaign,
      })
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Error updating campaign",
        error: error.message,
      })
    }
  },
)

// POST /api/campaigns/:id/updates - Add campaign update
router.post(
  "/:id/updates",
  [
    param("id").isNumeric().withMessage("Campaign ID must be a number"),
    body("title").trim().isLength({ min: 1, max: 200 }).withMessage("Update title must be 1-200 characters"),
    body("content").trim().isLength({ min: 1, max: 2000 }).withMessage("Update content must be 1-2000 characters"),
  ],
  handleValidationErrors,
  async (req, res) => {
    try {
      const campaignId = Number.parseInt(req.params.id)
      const { title, content } = req.body

      const campaign = await Campaign.findOneAndUpdate(
        { campaignId },
        {
          $push: {
            updates: {
              title,
              content,
              timestamp: new Date(),
            },
          },
        },
        { new: true },
      )

      if (!campaign) {
        return res.status(404).json({
          success: false,
          message: "Campaign not found",
        })
      }

      res.json({
        success: true,
        message: "Campaign update added successfully",
        data: campaign.updates[campaign.updates.length - 1],
      })
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Error adding campaign update",
        error: error.message,
      })
    }
  },
)

module.exports = router
