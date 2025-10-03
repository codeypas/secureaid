const mongoose = require("mongoose")
const fs = require("fs")
const path = require("path")
require("dotenv").config()

const Campaign = require("../server/models/Campaign")
const Donation = require("../server/models/Donation")
const Admin = require("../server/models/Admin")

const backupDatabase = async () => {
  try {
    console.log("Connecting to MongoDB...")
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    })
    console.log("Connected to MongoDB successfully")

    const timestamp = new Date().toISOString().replace(/[:.]/g, "-")
    const backupDir = path.join(__dirname, "..", "backups")

    // Create backups directory if it doesn't exist
    if (!fs.existsSync(backupDir)) {
      fs.mkdirSync(backupDir, { recursive: true })
    }

    console.log("Backing up campaigns...")
    const campaigns = await Campaign.find({}).lean()
    fs.writeFileSync(path.join(backupDir, `campaigns-${timestamp}.json`), JSON.stringify(campaigns, null, 2))

    console.log("Backing up donations...")
    const donations = await Donation.find({}).lean()
    fs.writeFileSync(path.join(backupDir, `donations-${timestamp}.json`), JSON.stringify(donations, null, 2))

    console.log("Backing up admin users...")
    const admins = await Admin.find({}).lean()
    fs.writeFileSync(path.join(backupDir, `admins-${timestamp}.json`), JSON.stringify(admins, null, 2))

    // Create a combined backup file
    const fullBackup = {
      timestamp: new Date().toISOString(),
      campaigns,
      donations,
      admins,
      stats: {
        campaignCount: campaigns.length,
        donationCount: donations.length,
        adminCount: admins.length,
      },
    }

    fs.writeFileSync(path.join(backupDir, `full-backup-${timestamp}.json`), JSON.stringify(fullBackup, null, 2))

    console.log(`Backup completed successfully. Files saved in: ${backupDir}`)
    console.log(`Backup timestamp: ${timestamp}`)
    console.log(`Campaigns: ${campaigns.length}`)
    console.log(`Donations: ${donations.length}`)
    console.log(`Admins: ${admins.length}`)

    process.exit(0)
  } catch (error) {
    console.error("Database backup failed:", error)
    process.exit(1)
  }
}

backupDatabase()
