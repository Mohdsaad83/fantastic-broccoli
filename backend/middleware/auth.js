const jwt = require("jsonwebtoken")
const User = require("../models/User")

const auth = async (req, res, next) => {
  try {
    const token = req.header("Authorization")

    if (!token || !token.startsWith("Bearer ")) {
      return res.status(401).json({
        success: false,
        message: "No token, authorization denied",
      })
    }

    // Extract token without 'Bearer ' prefix
    const actualToken = token.slice(7)
    const decoded = jwt.verify(actualToken, process.env.JWT_SECRET)

    // Use consistent property name - either decoded.user.id or decoded.userId
    const userId = decoded.user?.id || decoded.userId
    const user = await User.findById(userId).select("-password")

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid token. User not found.",
      })
    }

    if (!user.isActive) {
      return res.status(401).json({
        success: false,
        message: "Account is deactivated.",
      })
    }

    req.user = user
    next()
  } catch (error) {
    res.status(401).json({
      success: false,
      message: "Token is not valid",
    })
  }
}

const adminAuth = async (req, res, next) => {
  try {
    await auth(req, res, () => {
      if (req.user.role !== "admin") {
        return res.status(403).json({
          success: false,
          message: "Access denied. Admin privileges required.",
        })
      }
      next()
    })
  } catch (error) {
    res.status(401).json({
      success: false,
      message: "Authentication failed.",
    })
  }
}

const optionalAuth = async (req, res, next) => {
  try {
    const token = req.header("Authorization")?.replace("Bearer ", "")

    if (token) {
      const decoded = jwt.verify(token, process.env.JWT_SECRET)
      // Use consistent property name
      const userId = decoded.user?.id || decoded.userId
      const user = await User.findById(userId).select("-password")
      if (user && user.isActive) {
        req.user = user
      }
    }

    next()
  } catch (error) {
    // Continue without authentication
    next()
  }
}

module.exports = { auth, adminAuth, optionalAuth }
