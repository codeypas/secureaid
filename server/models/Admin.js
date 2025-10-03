const mongoose = require("mongoose")

const adminSchema = new mongoose.Schema(
  {
    address: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
    },
    role: {
      type: String,
      enum: ["super-admin", "admin", "moderator"],
      default: "admin",
    },
    permissions: [
      {
        type: String,
        enum: ["create-campaign", "edit-campaign", "delete-campaign", "withdraw-funds", "manage-users"],
      },
    ],
    isActive: {
      type: Boolean,
      default: true,
    },
    lastLogin: {
      type: Date,
    },
    loginCount: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  },
)

adminSchema.index({ address: 1 })
adminSchema.index({ role: 1 })

module.exports = mongoose.model("Admin", adminSchema)
