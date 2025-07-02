const express = require("express")
const { body } = require("express-validator")
const User = require("../models/User")
const Recipe = require("../models/Recipe")
const { auth, adminAuth } = require("../middleware/auth")
const validate = require("../middleware/validation")

const router = express.Router()

// Get current user profile (authenticated)
router.get("/profile", auth, async (req, res) => {
  try {
    // req.user is already populated by auth middleware
    const user = await User.findById(req.user._id)
      .select("-password")
      .populate("favoriteRecipes", "title image averageRating")
      .populate("createdRecipes", "title image averageRating createdAt")

    res.json(user || req.user)
  } catch (error) {
    console.error("Get profile error:", error)
    res.status(500).json({ error: "Failed to get profile" })
  }
})

// Get user profile by username
router.get("/:username", async (req, res) => {
  try {
    const user = await User.findOne({ username: req.params.username })
      .populate("createdRecipes", "title image averageRating createdAt")
      .select("-password -email")

    if (!user) {
      return res.status(404).json({ error: "User not found" })
    }

    res.json({ user })
  } catch (error) {
    console.error("Get user profile error:", error)
    res.status(500).json({ error: "Failed to get user profile" })
  }
})

// Get user's favorite recipes
router.get("/:username/favorites", async (req, res) => {
  try {
    const user = await User.findOne({ username: req.params.username })
      .populate({
        path: "favoriteRecipes",
        populate: [
          { path: "category", select: "name icon color" },
          { path: "author", select: "username firstName lastName" },
        ],
      })
      .select("favoriteRecipes")

    if (!user) {
      return res.status(404).json({ error: "User not found" })
    }

    res.json({ recipes: user.favoriteRecipes })
  } catch (error) {
    console.error("Get user favorites error:", error)
    res.status(500).json({ error: "Failed to get user favorites" })
  }
})

// Get user's created recipes
router.get("/:username/recipes", async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1
    const limit = parseInt(req.query.limit) || 12
    const skip = (page - 1) * limit

    const user = await User.findOne({ username: req.params.username })

    if (!user) {
      return res.status(404).json({ error: "User not found" })
    }

    const recipes = await Recipe.find({
      author: user._id,
      isPublished: true,
    })
      .populate("category", "name icon color")
      .populate("author", "username firstName lastName")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)

    const total = await Recipe.countDocuments({
      author: user._id,
      isPublished: true,
    })

    res.json({
      recipes,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
        hasNext: page < Math.ceil(total / limit),
        hasPrev: page > 1,
      },
    })
  } catch (error) {
    console.error("Get user recipes error:", error)
    res.status(500).json({ error: "Failed to get user recipes" })
  }
})

// Get all users (Admin only)
router.get("/", adminAuth, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1
    const limit = parseInt(req.query.limit) || 20
    const skip = (page - 1) * limit

    const users = await User.find()
      .select("-password")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)

    const total = await User.countDocuments()

    res.json({
      users,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
        hasNext: page < Math.ceil(total / limit),
        hasPrev: page > 1,
      },
    })
  } catch (error) {
    console.error("Get users error:", error)
    res.status(500).json({ error: "Failed to get users" })
  }
})

// Update user role (Admin only)
router.patch(
  "/:id/role",
  adminAuth,
  [
    body("role")
      .isIn(["user", "admin"])
      .withMessage("Role must be either user or admin"),
  ],
  validate,
  async (req, res) => {
    try {
      const { role } = req.body
      const userId = req.params.id

      // Prevent admin from changing their own role
      if (userId === req.user._id.toString()) {
        return res.status(400).json({ error: "Cannot change your own role" })
      }

      const user = await User.findByIdAndUpdate(
        userId,
        { role },
        { new: true }
      ).select("-password")

      if (!user) {
        return res.status(404).json({ error: "User not found" })
      }

      res.json({
        message: `User role updated to ${role}`,
        user,
      })
    } catch (error) {
      console.error("Update user role error:", error)
      res.status(500).json({ error: "Failed to update user role" })
    }
  }
)

// Toggle user active status (Admin only)
router.patch("/:id/toggle-active", adminAuth, async (req, res) => {
  try {
    const userId = req.params.id

    // Prevent admin from deactivating themselves
    if (userId === req.user._id.toString()) {
      return res
        .status(400)
        .json({ error: "Cannot deactivate your own account" })
    }

    const user = await User.findById(userId).select("-password")

    if (!user) {
      return res.status(404).json({ error: "User not found" })
    }

    user.isActive = !user.isActive
    await user.save()

    res.json({
      message: `User ${
        user.isActive ? "activated" : "deactivated"
      } successfully`,
      user,
    })
  } catch (error) {
    console.error("Toggle user status error:", error)
    res.status(500).json({ error: "Failed to toggle user status" })
  }
})

// Delete user account (Admin only)
router.delete("/:id", adminAuth, async (req, res) => {
  try {
    const userId = req.params.id

    // Prevent admin from deleting themselves
    if (userId === req.user._id.toString()) {
      return res.status(400).json({ error: "Cannot delete your own account" })
    }

    const user = await User.findById(userId)

    if (!user) {
      return res.status(404).json({ error: "User not found" })
    }

    // Delete all recipes by this user
    await Recipe.deleteMany({ author: userId })

    // Remove user from all favorite lists
    await User.updateMany(
      { favoriteRecipes: userId },
      { $pull: { favoriteRecipes: userId } }
    )

    // Delete the user
    await User.findByIdAndDelete(userId)

    res.json({ message: "User and all associated data deleted successfully" })
  } catch (error) {
    console.error("Delete user error:", error)
    res.status(500).json({ error: "Failed to delete user" })
  }
})

module.exports = router
