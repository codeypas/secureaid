const mongoose = require("mongoose")
require("dotenv").config()

const Campaign = require("../server/models/Campaign")
const Donation = require("../server/models/Donation")
const Admin = require("../server/models/Admin")

const setupDatabase = async () => {
  try {
    console.log("Connecting to MongoDB...")
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    })
    console.log("Connected to MongoDB successfully")

    // Create indexes for better performance
    console.log("Creating database indexes...")

    // Campaign indexes
    await Campaign.collection.createIndex({ campaignId: 1 }, { unique: true })
    await Campaign.collection.createIndex({ isActive: 1 })
    await Campaign.collection.createIndex({ category: 1 })
    await Campaign.collection.createIndex({ createdAt: -1 })

    // Donation indexes
    await Donation.collection.createIndex({ transactionHash: 1 }, { unique: true })
    await Donation.collection.createIndex({ campaignId: 1 })
    await Donation.collection.createIndex({ donor: 1 })
    await Donation.collection.createIndex({ timestamp: -1 })
    await Donation.collection.createIndex({ campaignId: 1, timestamp: -1 })

    // Admin indexes
    await Admin.collection.createIndex({ address: 1 }, { unique: true })
    await Admin.collection.createIndex({ role: 1 })

    console.log("Database indexes created successfully")

    // Create default admin user if none exists
    const adminCount = await Admin.countDocuments()
    if (adminCount === 0) {
      console.log("Creating default admin user...")
      const defaultAdmin = new Admin({
        address: "0x0000000000000000000000000000000000000000", // Replace with actual admin address
        role: "super-admin",
        permissions: ["create-campaign", "edit-campaign", "delete-campaign", "withdraw-funds", "manage-users"],
        isActive: true,
      })
      await defaultAdmin.save()
      console.log("Default admin user created")
    }

    console.log("Database setup completed successfully")
    process.exit(0)
  } catch (error) {
    console.error("Database setup failed:", error)
    process.exit(1)
  }
}

setupDatabase()
