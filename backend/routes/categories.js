const express = require("express")
const { body } = require("express-validator")
const Category = require("../models/Category")
const { auth, adminAuth } = require("../middleware/auth")
const validate = require("../middleware/validation")

const router = express.Router()

// Get all categories
router.get("/", async (req, res) => {
  try {
    const categories = await Category.find({ isActive: true }).sort({ name: 1 })

    res.json({ categories })
  } catch (error) {
    console.error("Get categories error:", error)
    res.status(500).json({ error: "Failed to get categories" })
  }
})

// Get category by ID
router.get("/:id", async (req, res) => {
  try {
    const category = await Category.findById(req.params.id)

    if (!category) {
      return res.status(404).json({ error: "Category not found" })
    }

    res.json({ category })
  } catch (error) {
    console.error("Get category error:", error)
    res.status(500).json({ error: "Failed to get category" })
  }
})

// Create new category (Admin only)
router.post(
  "/",
  adminAuth,
  [
    body("name")
      .notEmpty()
      .withMessage("Name is required")
      .isLength({ max: 50 })
      .withMessage("Name cannot exceed 50 characters"),
    body("description")
      .optional()
      .isLength({ max: 200 })
      .withMessage("Description cannot exceed 200 characters"),
    body("icon").optional().isString().withMessage("Icon must be a string"),
    body("color")
      .optional()
      .matches(/^#[0-9A-Fa-f]{6}$/)
      .withMessage("Color must be a valid hex color code"),
  ],
  validate,
  async (req, res) => {
    try {
      const { name, description, icon, color } = req.body

      // Check if category already exists
      const existingCategory = await Category.findOne({
        name: { $regex: new RegExp(`^${name}$`, "i") },
      })

      if (existingCategory) {
        return res.status(400).json({ error: "Category already exists" })
      }

      const category = new Category({
        name,
        description,
        icon: icon || "🍽️",
        color: color || "#4A90E2",
      })

      await category.save()

      res.status(201).json({
        message: "Category created successfully",
        category,
      })
    } catch (error) {
      console.error("Create category error:", error)
      res.status(500).json({ error: "Failed to create category" })
    }
  }
)

// Update category (Admin only)
router.put(
  "/:id",
  adminAuth,
  [
    body("name")
      .optional()
      .isLength({ max: 50 })
      .withMessage("Name cannot exceed 50 characters"),
    body("description")
      .optional()
      .isLength({ max: 200 })
      .withMessage("Description cannot exceed 200 characters"),
    body("icon").optional().isString().withMessage("Icon must be a string"),
    body("color")
      .optional()
      .matches(/^#[0-9A-Fa-f]{6}$/)
      .withMessage("Color must be a valid hex color code"),
  ],
  validate,
  async (req, res) => {
    try {
      const category = await Category.findById(req.params.id)

      if (!category) {
        return res.status(404).json({ error: "Category not found" })
      }

      // Check if name already exists (excluding current category)
      if (req.body.name) {
        const existingCategory = await Category.findOne({
          name: { $regex: new RegExp(`^${req.body.name}$`, "i") },
          _id: { $ne: req.params.id },
        })

        if (existingCategory) {
          return res.status(400).json({ error: "Category name already exists" })
        }
      }

      const updatedCategory = await Category.findByIdAndUpdate(
        req.params.id,
        req.body,
        { new: true, runValidators: true }
      )

      res.json({
        message: "Category updated successfully",
        category: updatedCategory,
      })
    } catch (error) {
      console.error("Update category error:", error)
      res.status(500).json({ error: "Failed to update category" })
    }
  }
)

// Delete category (Admin only)
router.delete("/:id", adminAuth, async (req, res) => {
  try {
    const category = await Category.findById(req.params.id)

    if (!category) {
      return res.status(404).json({ error: "Category not found" })
    }

    // Check if category has recipes
    if (category.recipeCount > 0) {
      return res.status(400).json({
        error:
          "Cannot delete category with existing recipes. Please move or delete all recipes first.",
      })
    }

    await Category.findByIdAndDelete(req.params.id)

    res.json({ message: "Category deleted successfully" })
  } catch (error) {
    console.error("Delete category error:", error)
    res.status(500).json({ error: "Failed to delete category" })
  }
})

// Toggle category active status (Admin only)
router.patch("/:id/toggle-active", adminAuth, async (req, res) => {
  try {
    const category = await Category.findById(req.params.id)

    if (!category) {
      return res.status(404).json({ error: "Category not found" })
    }

    category.isActive = !category.isActive
    await category.save()

    res.json({
      message: `Category ${
        category.isActive ? "activated" : "deactivated"
      } successfully`,
      category,
    })
  } catch (error) {
    console.error("Toggle category status error:", error)
    res.status(500).json({ error: "Failed to toggle category status" })
  }
})

module.exports = router
