const express = require("express")
const cors = require("cors")
const helmet = require("helmet")
const morgan = require("morgan")
const compression = require("compression")
const rateLimit = require("express-rate-limit")
require("dotenv").config()

const connectDB = require("./config/database")
const campaignRoutes = require("./routes/campaigns")
const donationRoutes = require("./routes/donations")
const adminRoutes = require("./routes/admin")
const blockchainRoutes = require("./routes/blockchain")
const errorHandler = require("./middleware/errorHandler")

const app = express()
const PORT = process.env.PORT || 5000

// Connect to MongoDB
connectDB()

// Security middleware
app.use(helmet())
app.use(compression())

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: "Too many requests from this IP, please try again later.",
})
app.use(limiter)

// CORS configuration
app.use(
  cors({
    origin: process.env.NODE_ENV === "production" ? process.env.FRONTEND_URL : "http://localhost:3000",
    credentials: true,
  }),
)

// Body parsing middleware
app.use(express.json({ limit: "10mb" }))
app.use(express.urlencoded({ extended: true, limit: "10mb" }))

// Logging middleware
app.use(morgan("combined"))

// Health check endpoint
app.get("/health", (req, res) => {
  res.status(200).json({
    status: "OK",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  })
})

// API routes
app.use("/api/campaigns", campaignRoutes)
app.use("/api/donations", donationRoutes)
app.use("/api/admin", adminRoutes)
app.use("/api/blockchain", blockchainRoutes)

// 404 handler
app.use("*", (req, res) => {
  res.status(404).json({
    success: false,
    message: "Route not found",
  })
})

// Error handling middleware
app.use(errorHandler)

// Graceful shutdown
process.on("SIGTERM", () => {
  console.log("SIGTERM received. Shutting down gracefully...")
  process.exit(0)
})

process.on("SIGINT", () => {
  console.log("SIGINT received. Shutting down gracefully...")
  process.exit(0)
})

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
  console.log(`Environment: ${process.env.NODE_ENV || "development"}`)
})

module.exports = app
