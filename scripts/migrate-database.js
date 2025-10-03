const mongoose = require("mongoose")
require("dotenv").config()

const Campaign = require("../server/models/Campaign")
const Donation = require("../server/models/Donation")
const Admin = require("../server/models/Admin")

const migrations = [
  {
    version: "1.0.0",
    description: "Initial database setup",
    up: async () => {
      console.log("Running initial database setup...")
      // This migration is handled by setup-database.js
      return true
    },
  },
  {
    version: "1.1.0",
    description: "Add category field to campaigns",
    up: async () => {
      console.log("Adding category field to campaigns...")
      await Campaign.updateMany({ category: { $exists: false } }, { $set: { category: "disaster-relief" } })
      return true
    },
  },
  {
    version: "1.2.0",
    description: "Add location field to campaigns",
    up: async () => {
      console.log("Adding location field to campaigns...")
      await Campaign.updateMany({ location: { $exists: false } }, { $set: { location: "" } })
      return true
    },
  },
  {
    version: "1.3.0",
    description: "Add isAnonymous field to donations",
    up: async () => {
      console.log("Adding isAnonymous field to donations...")
      await Donation.updateMany({ isAnonymous: { $exists: false } }, { $set: { isAnonymous: false } })
      return true
    },
  },
]

const runMigrations = async () => {
  try {
    console.log("Connecting to MongoDB...")
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    })
    console.log("Connected to MongoDB successfully")

    // Create migrations collection if it doesn't exist
    const db = mongoose.connection.db
    const migrationsCollection = db.collection("migrations")

    // Get completed migrations
    const completedMigrations = await migrationsCollection.find({}).toArray()
    const completedVersions = completedMigrations.map((m) => m.version)

    console.log(`Found ${completedMigrations.length} completed migrations`)

    // Run pending migrations
    for (const migration of migrations) {
      if (!completedVersions.includes(migration.version)) {
        console.log(`\nRunning migration ${migration.version}: ${migration.description}`)

        try {
          await migration.up()

          // Record successful migration
          await migrationsCollection.insertOne({
            version: migration.version,
            description: migration.description,
            completedAt: new Date(),
          })

          console.log(`Migration ${migration.version} completed successfully`)
        } catch (error) {
          console.error(`Migration ${migration.version} failed:`, error)
          throw error
        }
      } else {
        console.log(`Migration ${migration.version} already completed, skipping...`)
      }
    }

    console.log("\nAll migrations completed successfully")
    process.exit(0)
  } catch (error) {
    console.error("Migration failed:", error)
    process.exit(1)
  }
}

runMigrations()
