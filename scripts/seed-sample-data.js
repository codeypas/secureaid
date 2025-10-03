const mongoose = require("mongoose")
require("dotenv").config()

const Campaign = require("../server/models/Campaign")
const Donation = require("../server/models/Donation")

const sampleCampaigns = [
  {
    campaignId: 0,
    title: "Emergency Flood Relief - Bangladesh",
    description:
      "Urgent relief needed for flood victims in Bangladesh. Funds will be used for food, clean water, medical supplies, and temporary shelter for displaced families.",
    targetAmount: "50.0",
    totalRaised: "0",
    beneficiary: "0x742d35Cc6634C0532925a3b8D4C9db96590c6C87",
    category: "disaster-relief",
    location: "Bangladesh",
    isActive: true,
    images: [
      {
        url: "/flood-relief-bangladesh.jpg",
        caption: "Flood affected areas in Bangladesh",
      },
    ],
  },
  {
    campaignId: 1,
    title: "Earthquake Recovery - Turkey",
    description:
      "Supporting earthquake survivors with emergency shelter, medical care, and rebuilding efforts. Every donation helps families get back on their feet.",
    targetAmount: "100.0",
    totalRaised: "0",
    beneficiary: "0x8ba1f109551bD432803012645Hac136c22C177ec",
    category: "disaster-relief",
    location: "Turkey",
    isActive: true,
    images: [
      {
        url: "/earthquake-recovery-turkey.jpg",
        caption: "Earthquake recovery efforts in Turkey",
      },
    ],
  },
  {
    campaignId: 2,
    title: "Wildfire Emergency Response - California",
    description:
      "Immediate assistance for wildfire evacuees including temporary housing, food, clothing, and support for families who lost their homes.",
    targetAmount: "75.0",
    totalRaised: "0",
    beneficiary: "0x2546BcD3c84621e976D8185a91A922aE77ECEc30",
    category: "disaster-relief",
    location: "California, USA",
    isActive: true,
    images: [
      {
        url: "/wildfire-emergency-california.jpg",
        caption: "Wildfire emergency response in California",
      },
    ],
  },
]

const seedDatabase = async () => {
  try {
    console.log("Connecting to MongoDB...")
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    })
    console.log("Connected to MongoDB successfully")

    // Clear existing data (optional - remove in production)
    console.log("Clearing existing campaigns...")
    await Campaign.deleteMany({})
    await Donation.deleteMany({})

    // Insert sample campaigns
    console.log("Inserting sample campaigns...")
    await Campaign.insertMany(sampleCampaigns)
    console.log(`${sampleCampaigns.length} sample campaigns inserted`)

    // Create some sample donations
    console.log("Creating sample donations...")
    const sampleDonations = [
      {
        campaignId: 0,
        transactionHash: "0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef",
        donor: "0x742d35Cc6634C0532925a3b8D4C9db96590c6C87",
        amount: "0.5",
        message: "Hope this helps the flood victims. Stay strong!",
        timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
        blockNumber: 12345,
        gasUsed: "21000",
        gasPrice: "20",
      },
      {
        campaignId: 0,
        transactionHash: "0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890",
        donor: "0x8ba1f109551bD432803012645Hac136c22C177ec",
        amount: "1.0",
        message: "Sending prayers and support from our family.",
        timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
        blockNumber: 12346,
        gasUsed: "21000",
        gasPrice: "22",
      },
      {
        campaignId: 1,
        transactionHash: "0x9876543210fedcba9876543210fedcba9876543210fedcba9876543210fedcba",
        donor: "0x2546BcD3c84621e976D8185a91A922aE77ECEc30",
        amount: "2.0",
        message: "For the earthquake survivors. We stand with you.",
        timestamp: new Date(Date.now() - 3 * 60 * 60 * 1000), // 3 hours ago
        blockNumber: 12347,
        gasUsed: "21000",
        gasPrice: "25",
      },
    ]

    await Donation.insertMany(sampleDonations)
    console.log(`${sampleDonations.length} sample donations inserted`)

    console.log("Sample data seeded successfully")
    process.exit(0)
  } catch (error) {
    console.error("Database seeding failed:", error)
    process.exit(1)
  }
}

seedDatabase()
