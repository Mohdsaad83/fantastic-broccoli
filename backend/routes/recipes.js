const express = require("express")
const { body, query, param } = require("express-validator")
const Recipe = require("../models/Recipe")
const Category = require("../models/Category")
const User = require("../models/User")
const { auth, optionalAuth } = require("../middleware/auth")
const validate = require("../middleware/validation")

const router = express.Router()

// Get all recipes with filtering and pagination
router.get(
  "/",
  [
    query("page")
      .optional()
      .isInt({ min: 1 })
      .withMessage("Page must be a positive integer"),
    query("limit")
      .optional()
      .isInt({ min: 1, max: 50 })
      .withMessage("Limit must be between 1 and 50"),
    query("category")
      .optional()
      .isMongoId()
      .withMessage("Category must be a valid ID"),
    query("difficulty")
      .optional()
      .isIn(["easy", "medium", "hard"])
      .withMessage("Difficulty must be easy, medium, or hard"),
    query("maxTime")
      .optional()
      .isInt({ min: 1 })
      .withMessage("Max time must be a positive integer"),
    query("minRating")
      .optional()
      .isFloat({ min: 0, max: 5 })
      .withMessage("Min rating must be between 0 and 5"),
    query("dietaryTags")
      .optional()
      .isString()
      .withMessage("Dietary tags must be a comma-separated string"),
    query("sortBy")
      .optional()
      .isIn(["createdAt", "averageRating", "views", "totalTime", "healthScore"])
      .withMessage("Invalid sort field"),
    query("sortOrder")
      .optional()
      .isIn(["asc", "desc"])
      .withMessage("Sort order must be asc or desc"),
  ],
  validate,
  optionalAuth,
  async (req, res) => {
    try {
      const page = parseInt(req.query.page) || 1
      const limit = parseInt(req.query.limit) || 12
      const skip = (page - 1) * limit

      // Build filter object
      let filter = { isPublished: true }

      if (req.query.category) {
        filter.category = req.query.category
      }

      if (req.query.difficulty) {
        filter.difficulty = req.query.difficulty
      }

      if (req.query.maxTime) {
        filter.$expr = {
          $lte: [
            { $add: ["$prepTime", "$cookTime"] },
            parseInt(req.query.maxTime),
          ],
        }
      }

      if (req.query.minRating) {
        filter.averageRating = { $gte: parseFloat(req.query.minRating) }
      }

      if (req.query.dietaryTags) {
        const tags = req.query.dietaryTags.split(",").map((tag) => tag.trim())
        filter.dietaryTags = { $in: tags }
      }

      if (req.query.search) {
        filter.$text = { $search: req.query.search }
      }

      // Build sort object
      let sort = {}
      const sortBy = req.query.sortBy || "createdAt"
      const sortOrder = req.query.sortOrder === "asc" ? 1 : -1
      sort[sortBy] = sortOrder

      // If sorting by text search, include score
      if (req.query.search) {
        sort.score = { $meta: "textScore" }
      }

      const recipes = await Recipe.find(filter)
        .populate("category", "name icon color")
        .populate("author", "username firstName lastName")
        .select("-ratings")
        .sort(sort)
        .skip(skip)
        .limit(limit)

      const total = await Recipe.countDocuments(filter)

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
      console.error("Get recipes error:", error)
      res.status(500).json({ error: "Failed to get recipes" })
    }
  }
)

// Get featured recipes
router.get("/featured", async (req, res) => {
  try {
    const featuredRecipes = await Recipe.find({
      isPublished: true,
      isFeatured: true,
    })
      .populate("category", "name icon color")
      .populate("author", "username firstName lastName")
      .select("-ratings")
      .sort({ averageRating: -1 })
      .limit(6)

    res.json({ recipes: featuredRecipes })
  } catch (error) {
    console.error("Get featured recipes error:", error)
    res.status(500).json({ error: "Failed to get featured recipes" })
  }
})

// Get popular recipes
router.get("/popular", async (req, res) => {
  try {
    const popularRecipes = await Recipe.find({
      isPublished: true,
      averageRating: { $gte: 4 },
    })
      .populate("category", "name icon color")
      .populate("author", "username firstName lastName")
      .select("-ratings")
      .sort({ views: -1, averageRating: -1 })
      .limit(10)

    res.json({ recipes: popularRecipes })
  } catch (error) {
    console.error("Get popular recipes error:", error)
    res.status(500).json({ error: "Failed to get popular recipes" })
  }
})

// Get user's favorite recipes
router.get("/favorites", auth, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate("favoriteRecipes")

    res.json({
      favorites: user.favoriteRecipes || [],
    })
  } catch (error) {
    console.error("Get favorites error:", error)
    res.status(500).json({ error: "Failed to get favorite recipes" })
  }
})

// Get recipe by ID
router.get(
  "/:id",
  [param("id").isMongoId().withMessage("Recipe ID must be valid")],
  validate,
  optionalAuth,
  async (req, res) => {
    try {
      console.log("🔍 Getting recipe by ID:", req.params.id)

      // First, try to find the recipe without population
      const recipe = await Recipe.findById(req.params.id)
      console.log("📦 Recipe found (no population):", recipe ? "YES" : "NO")

      if (!recipe) {
        console.log("❌ Recipe not found in database")
        return res.status(404).json({ error: "Recipe not found" })
      }

      console.log("📝 Recipe title:", recipe.title)
      console.log("📄 Is published:", recipe.isPublished)

      if (!recipe.isPublished) {
        console.log("❌ Recipe not published")
        return res.status(404).json({ error: "Recipe not found" })
      }

      // Now try with population (excluding problematic ratings)
      const populatedRecipe = await Recipe.findById(req.params.id)
        .populate("category", "name icon color")
        .populate("author", "username firstName lastName avatar")
        .select("-ratings") // Exclude ratings to avoid validation issues

      console.log("📦 Populated recipe found:", populatedRecipe ? "YES" : "NO")

      // Increment view count using direct database update to avoid validation issues
      await Recipe.findByIdAndUpdate(req.params.id, { $inc: { views: 1 } })

      console.log("✅ Returning recipe successfully")
      res.json({ recipe: populatedRecipe })
    } catch (error) {
      console.error("❌ Get recipe error:", error)
      console.error("❌ Error stack:", error.stack)
      res.status(500).json({ error: "Failed to get recipe" })
    }
  }
)

// Create new recipe
router.post(
  "/",
  auth,
  [
    body("title")
      .notEmpty()
      .withMessage("Title is required")
      .isLength({ max: 100 })
      .withMessage("Title cannot exceed 100 characters"),
    body("description")
      .notEmpty()
      .withMessage("Description is required")
      .isLength({ max: 500 })
      .withMessage("Description cannot exceed 500 characters"),
    body("category").isMongoId().withMessage("Category must be a valid ID"),
    body("ingredients")
      .isArray({ min: 1 })
      .withMessage("At least one ingredient is required"),
    body("instructions")
      .isArray({ min: 1 })
      .withMessage("At least one instruction is required"),
    body("servings")
      .isInt({ min: 1 })
      .withMessage("Servings must be at least 1"),
    body("prepTime")
      .isInt({ min: 0 })
      .withMessage("Prep time must be a positive number"),
    body("cookTime")
      .isInt({ min: 0 })
      .withMessage("Cook time must be a positive number"),
    body("difficulty")
      .optional()
      .isIn(["easy", "medium", "hard"])
      .withMessage("Difficulty must be easy, medium, or hard"),
  ],
  validate,
  async (req, res) => {
    try {
      const recipeData = {
        ...req.body,
        author: req.user._id,
      }

      // Validate category exists
      const category = await Category.findById(req.body.category)
      if (!category) {
        return res.status(400).json({ error: "Invalid category" })
      }

      const recipe = new Recipe(recipeData)

      // Calculate health score
      recipe.calculateHealthScore()

      await recipe.save()

      // Update user's created recipes (only if user is authenticated)
      if (req.user) {
        await User.findByIdAndUpdate(req.user._id, {
          $push: { createdRecipes: recipe._id },
        })
      }

      // Update category recipe count
      await category.updateRecipeCount()

      const populatedRecipe = await Recipe.findById(recipe._id)
        .populate("category", "name icon color")
        .populate("author", "username firstName lastName")

      res.status(201).json({
        message: "Recipe created successfully",
        recipe: populatedRecipe,
      })
    } catch (error) {
      console.error("Create recipe error:", error)
      res.status(500).json({ error: "Failed to create recipe" })
    }
  }
)

// Update recipe
router.put(
  "/:id",
  auth,
  [
    body("title")
      .optional()
      .isLength({ max: 100 })
      .withMessage("Title cannot exceed 100 characters"),
    body("description")
      .optional()
      .isLength({ max: 500 })
      .withMessage("Description cannot exceed 500 characters"),
    body("category")
      .optional()
      .isMongoId()
      .withMessage("Category must be a valid ID"),
    body("servings")
      .optional()
      .isInt({ min: 1 })
      .withMessage("Servings must be at least 1"),
    body("prepTime")
      .optional()
      .isInt({ min: 0 })
      .withMessage("Prep time must be a positive number"),
    body("cookTime")
      .optional()
      .isInt({ min: 0 })
      .withMessage("Cook time must be a positive number"),
    body("difficulty")
      .optional()
      .isIn(["easy", "medium", "hard"])
      .withMessage("Difficulty must be easy, medium, or hard"),
  ],
  validate,
  async (req, res) => {
    try {
      const recipe = await Recipe.findById(req.params.id)

      if (!recipe) {
        return res.status(404).json({ error: "Recipe not found" })
      }

      // Check if user owns the recipe
      if (recipe.author.toString() !== req.user._id.toString()) {
        return res
          .status(403)
          .json({ error: "Not authorized to update this recipe" })
      }

      // Validate category if provided
      if (req.body.category) {
        const category = await Category.findById(req.body.category)
        if (!category) {
          return res.status(400).json({ error: "Invalid category" })
        }
      }

      const updatedRecipe = await Recipe.findByIdAndUpdate(
        req.params.id,
        req.body,
        { new: true, runValidators: true }
      )
        .populate("category", "name icon color")
        .populate("author", "username firstName lastName")

      // Recalculate health score if nutrition or dietary tags changed
      if (req.body.nutrition || req.body.dietaryTags) {
        updatedRecipe.calculateHealthScore()
        await updatedRecipe.save()
      }

      res.json({
        message: "Recipe updated successfully",
        recipe: updatedRecipe,
      })
    } catch (error) {
      console.error("Update recipe error:", error)
      res.status(500).json({ error: "Failed to update recipe" })
    }
  }
)

// Delete recipe
router.delete("/:id", auth, async (req, res) => {
  try {
    const recipe = await Recipe.findById(req.params.id)

    if (!recipe) {
      return res.status(404).json({ error: "Recipe not found" })
    }

    // Check if user owns the recipe
    if (recipe.author.toString() !== req.user._id.toString()) {
      return res
        .status(403)
        .json({ error: "Not authorized to delete this recipe" })
    }

    await Recipe.findByIdAndDelete(req.params.id)

    // Remove from user's created recipes
    await User.findByIdAndUpdate(req.user._id, {
      $pull: { createdRecipes: req.params.id },
    })

    // Remove from all users' favorite recipes
    await User.updateMany(
      { favoriteRecipes: req.params.id },
      { $pull: { favoriteRecipes: req.params.id } }
    )

    // Update category recipe count
    const category = await Category.findById(recipe.category)
    if (category) {
      await category.updateRecipeCount()
    }

    res.json({ message: "Recipe deleted successfully" })
  } catch (error) {
    console.error("Delete recipe error:", error)
    res.status(500).json({ error: "Failed to delete recipe" })
  }
})

// Add rating to recipe
router.post(
  "/:id/ratings",
  auth,
  [
    body("rating")
      .isFloat({ min: 1, max: 5 })
      .withMessage("Rating must be between 1 and 5"),
    body("comment")
      .optional()
      .isLength({ max: 500 })
      .withMessage("Comment cannot exceed 500 characters"),
  ],
  validate,
  async (req, res) => {
    try {
      const { rating, comment } = req.body
      const recipe = await Recipe.findById(req.params.id)

      if (!recipe) {
        return res.status(404).json({ error: "Recipe not found" })
      }

      // Check if user already rated this recipe
      const existingRating = recipe.ratings.find(
        (r) => r.user.toString() === req.user._id.toString()
      )

      if (existingRating) {
        // Update existing rating
        existingRating.rating = rating
        existingRating.comment = comment || existingRating.comment
      } else {
        // Add new rating
        recipe.ratings.push({
          user: req.user._id,
          rating,
          comment,
        })
      }

      recipe.updateAverageRating()
      await recipe.save()

      res.json({
        message: existingRating
          ? "Rating updated successfully"
          : "Rating added successfully",
        averageRating: recipe.averageRating,
        totalRatings: recipe.totalRatings,
      })
    } catch (error) {
      console.error("Add rating error:", error)
      res.status(500).json({ error: "Failed to add rating" })
    }
  }
)

// Check if recipe is favorited by current user
router.get("/:id/favorite", auth, async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
    const isFavorite = user.favoriteRecipes.includes(req.params.id)

    res.json({
      isFavorite,
    })
  } catch (error) {
    console.error("Check favorite error:", error)
    res.status(500).json({ error: "Failed to check favorite status" })
  }
})

// Add recipe to favorites
router.post("/:id/favorite", auth, async (req, res) => {
  try {
    const recipe = await Recipe.findById(req.params.id)

    if (!recipe) {
      return res.status(404).json({ error: "Recipe not found" })
    }

    const user = await User.findById(req.user._id)
    const isFavorite = user.favoriteRecipes.includes(req.params.id)

    if (isFavorite) {
      return res.json({
        message: "Recipe is already in favorites",
        isFavorite: true,
      })
    }

    user.favoriteRecipes.push(req.params.id)
    await user.save()

    res.json({
      message: "Recipe added to favorites",
      isFavorite: true,
    })
  } catch (error) {
    console.error("Add to favorites error:", error)
    res.status(500).json({ error: "Failed to add to favorites" })
  }
})

// Remove recipe from favorites
router.delete("/:id/favorite", auth, async (req, res) => {
  try {
    const recipe = await Recipe.findById(req.params.id)

    if (!recipe) {
      return res.status(404).json({ error: "Recipe not found" })
    }

    const user = await User.findById(req.user._id)
    const isFavorite = user.favoriteRecipes.includes(req.params.id)

    if (!isFavorite) {
      return res.json({
        message: "Recipe is not in favorites",
        isFavorite: false,
      })
    }

    user.favoriteRecipes.pull(req.params.id)
    await user.save()

    res.json({
      message: "Recipe removed from favorites",
      isFavorite: false,
    })
  } catch (error) {
    console.error("Remove from favorites error:", error)
    res.status(500).json({ error: "Failed to remove from favorites" })
  }
})

// Get user's own recipes
router.get("/user", auth, async (req, res) => {
  try {
    const recipes = await Recipe.find({ author: req.user._id })
      .populate("category", "name icon color")
      .sort({ createdAt: -1 })

    res.json({ recipes })
  } catch (error) {
    console.error("Get user recipes error:", error)
    res.status(500).json({ error: "Failed to fetch your recipes" })
  }
})

module.exports = router
