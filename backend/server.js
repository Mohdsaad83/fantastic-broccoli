const express = require("express")
const mongoose = require("mongoose")
const cors = require("cors")
require("dotenv").config()

const app = express()

// Enhanced CORS configuration
const corsOptions = {
  origin: [
    "http://localhost:3000",
    "http://localhost:3001",
    process.env.CORS_ORIGIN,
  ].filter(Boolean),
  credentials: true,
  optionsSuccessStatus: 200,
}

// Middleware
app.use(cors(corsOptions))
app.use(express.json({ limit: "50mb" }))
app.use(express.urlencoded({ extended: true, limit: "50mb" }))

// Serve static files
app.use("/recipe-images", express.static("public/recipe-images"))

// Routes
app.use("/api/auth", require("./routes/auth"))
app.use("/api/recipes", require("./routes/recipes"))
app.use("/api/categories", require("./routes/categories"))
app.use("/api/users", require("./routes/users"))

// Test route
app.get("/", (req, res) => {
  res.json({ message: "Fantastic Broccoli API is running!" })
})

// Connect to MongoDB
mongoose
  .connect(
    process.env.MONGODB_URI || "mongodb://localhost:27017/fantastic-broccoli"
  )
  .then(() => console.log("MongoDB Connected:", mongoose.connection.host))
  .catch((err) => console.error("MongoDB connection error:", err))

const PORT = process.env.PORT || 3004
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})
