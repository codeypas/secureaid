const mongoose = require("mongoose")

const campaignSchema = new mongoose.Schema(
  {
    campaignId: {
      type: Number,
      required: true,
      unique: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 200,
    },
    description: {
      type: String,
      required: true,
      trim: true,
      maxlength: 1000,
    },
    targetAmount: {
      type: String,
      required: true,
    },
    totalRaised: {
      type: String,
      default: "0",
    },
    beneficiary: {
      type: String,
      required: true,
      lowercase: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
    updatedAt: {
      type: Date,
      default: Date.now,
    },
    // Additional metadata not stored on blockchain
    category: {
      type: String,
      enum: ["disaster-relief", "medical", "education", "environment", "other"],
      default: "disaster-relief",
    },
    location: {
      type: String,
      trim: true,
    },
    images: [
      {
        url: String,
        caption: String,
      },
    ],
    updates: [
      {
        title: String,
        content: String,
        timestamp: {
          type: Date,
          default: Date.now,
        },
      },
    ],
  },
  {
    timestamps: true,
  },
)

// Index for efficient queries
campaignSchema.index({ campaignId: 1 })
campaignSchema.index({ isActive: 1 })
campaignSchema.index({ category: 1 })
campaignSchema.index({ createdAt: -1 })

// Update the updatedAt field before saving
campaignSchema.pre("save", function (next) {
  this.updatedAt = Date.now()
  next()
})

module.exports = mongoose.model("Campaign", campaignSchema)
