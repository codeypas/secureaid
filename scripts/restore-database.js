const mongoose = require("mongoose")
const fs = require("fs")
const path = require("path")
require("dotenv").config()

const Campaign = require("../server/models/Campaign")
const Donation = require("../server/models/Donation")
const Admin = require("../server/models/Admin")

const restoreDatabase = async (backupFile) => {
  try {
    if (!backupFile) {
      console.error("Please provide a backup file path")
      console.log("Usage: node restore-database.js <backup-file-path>")
      process.exit(1)
    }

    const backupPath = path.resolve(backupFile)
    if (!fs.existsSync(backupPath)) {
      console.error(`Backup file not found: ${backupPath}`)
      process.exit(1)
    }

    console.log("Connecting to MongoDB...")
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    })
    console.log("Connected to MongoDB successfully")

    console.log(`Reading backup file: ${backupPath}`)
    const backupData = JSON.parse(fs.readFileSync(backupPath, "utf8"))

    // Validate backup data structure
    if (!backupData.campaigns || !backupData.donations || !backupData.admins) {
      console.error("Invalid backup file format")
      process.exit(1)
    }

    console.log("Backup file validation passed")
    console.log(`Backup timestamp: ${backupData.timestamp}`)
    console.log(`Campaigns to restore: ${backupData.campaigns.length}`)
    console.log(`Donations to restore: ${backupData.donations.length}`)
    console.log(`Admins to restore: ${backupData.admins.length}`)

    // Ask for confirmation (in a real scenario, you might want to add readline for user input)
    console.log("\nWARNING: This will replace all existing data!")
    console.log("Proceeding with restore...")

    // Clear existing data
    console.log("Clearing existing data...")
    await Campaign.deleteMany({})
    await Donation.deleteMany({})
    await Admin.deleteMany({})

    // Restore data
    console.log("Restoring campaigns...")
    if (backupData.campaigns.length > 0) {
      await Campaign.insertMany(backupData.campaigns)
    }

    console.log("Restoring donations...")
    if (backupData.donations.length > 0) {
      await Donation.insertMany(backupData.donations)
    }

    console.log("Restoring admin users...")
    if (backupData.admins.length > 0) {
      await Admin.insertMany(backupData.admins)
    }

    console.log("Database restore completed successfully")
    console.log(`Restored ${backupData.campaigns.length} campaigns`)
    console.log(`Restored ${backupData.donations.length} donations`)
    console.log(`Restored ${backupData.admins.length} admin users`)

    process.exit(0)
  } catch (error) {
    console.error("Database restore failed:", error)
    process.exit(1)
  }
}

// Get backup file from command line arguments
const backupFile = process.argv[2]
restoreDatabase(backupFile)
