const mongoose = require("mongoose")

const donationSchema = new mongoose.Schema(
  {
    campaignId: {
      type: Number,
      required: true,
    },
    transactionHash: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
    },
    donor: {
      type: String,
      required: true,
      lowercase: true,
    },
    amount: {
      type: String,
      required: true,
    },
    message: {
      type: String,
      trim: true,
      maxlength: 500,
    },
    blockNumber: {
      type: Number,
    },
    gasUsed: {
      type: String,
    },
    gasPrice: {
      type: String,
    },
    timestamp: {
      type: Date,
      required: true,
    },
    // Additional metadata
    isAnonymous: {
      type: Boolean,
      default: false,
    },
    donorEmail: {
      type: String,
      trim: true,
      lowercase: true,
    },
    donorName: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
  },
)

// Indexes for efficient queries
donationSchema.index({ campaignId: 1 })
donationSchema.index({ donor: 1 })
donationSchema.index({ transactionHash: 1 })
donationSchema.index({ timestamp: -1 })
donationSchema.index({ campaignId: 1, timestamp: -1 })

module.exports = mongoose.model("Donation", donationSchema)
