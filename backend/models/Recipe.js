const mongoose = require("mongoose")
const nutritionSchema = require("./Nutrition")
const ingredientSchema = require("./Ingredient")
const instructionSchema = require("./Instruction")

// Constants previously in constants.js
const DIETARY_TAGS = [
  "vegetarian",
  "vegan",
  "gluten-free",
  "dairy-free",
  "keto",
  "paleo",
  "low-carb",
  "mediterranean",
  "high-protein",
  "low-sodium",
  "nut-free",
  "egg-free",
  "soy-free",
  "pescatarian",
]

const DIFFICULTY_LEVELS = ["easy", "medium", "hard"]

const HEALTHY_TAGS = [
  "vegetarian",
  "vegan",
  "gluten-free",
  "high-protein",
  "low-sodium",
]

// Define rating schema directly in Recipe.js
const ratingSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  rating: {
    type: Number,
    required: true,
    min: [1, "Rating must be at least 1"],
    max: [5, "Rating cannot exceed 5"],
  },
  comment: {
    type: String,
    maxlength: [500, "Comment cannot exceed 500 characters"],
    trim: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
})

const recipeSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Recipe title is required"],
      trim: true,
      minlength: [3, "Title must be at least 3 characters"],
      maxlength: [100, "Title cannot exceed 100 characters"],
    },
    description: {
      type: String,
      required: [true, "Recipe description is required"],
      trim: true,
      minlength: [10, "Description must be at least 10 characters"],
      maxlength: [500, "Description cannot exceed 500 characters"],
    },
    image: {
      type: String,
      default: null,
      validate: {
        validator: function (v) {
          return (
            !v ||
            /^https?:\/\/.+/.test(v) ||
            /^data:image\/.+/.test(v) ||
            /^\/uploads\/.+/.test(v) ||
            /^\/recipe-images\/.+/.test(v)
          )
        },
        message: "Image must be a valid URL or data URI",
      },
    },
    imagePublicId: {
      type: String,
      default: null,
    },
    imageAltText: {
      type: String,
      default: null,
      maxlength: [200, "Alt text cannot exceed 200 characters"],
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      required: [true, "Category is required"],
    },
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Author is required"],
    },
    ingredients: {
      type: [ingredientSchema],
      validate: {
        validator: function (v) {
          return v && v.length > 0
        },
        message: "At least one ingredient is required",
      },
    },
    instructions: {
      type: [instructionSchema],
      validate: {
        validator: function (v) {
          return v && v.length > 0
        },
        message: "At least one instruction is required",
      },
    },
    nutrition: nutritionSchema,
    servings: {
      type: Number,
      required: [true, "Number of servings is required"],
      min: [1, "Servings must be at least 1"],
      max: [50, "Servings cannot exceed 50"],
    },
    prepTime: {
      type: Number,
      required: [true, "Prep time is required"],
      min: [0, "Prep time cannot be negative"],
      max: [1440, "Prep time cannot exceed 24 hours"],
    },
    cookTime: {
      type: Number,
      required: [true, "Cook time is required"],
      min: [0, "Cook time cannot be negative"],
      max: [1440, "Cook time cannot exceed 24 hours"],
    },
    difficulty: {
      type: String,
      enum: {
        values: DIFFICULTY_LEVELS,
        message: "{VALUE} is not a valid difficulty level",
      },
      default: "medium",
    },
    dietaryTags: [
      {
        type: String,
        enum: {
          values: DIETARY_TAGS,
          message: "{VALUE} is not a valid dietary tag",
        },
      },
    ],
    healthScore: {
      type: Number,
      min: [0, "Health score cannot be negative"],
      max: [100, "Health score cannot exceed 100"],
      default: 50,
    },
    ratings: [ratingSchema],
    averageRating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },
    totalRatings: {
      type: Number,
      default: 0,
      min: 0,
    },
    views: {
      type: Number,
      default: 0,
      min: 0,
    },
    isPublished: {
      type: Boolean,
      default: true,
    },
    isFeatured: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
)

// Pre-save middleware
recipeSchema.pre("save", function (next) {
  // Validate instruction step numbers are sequential
  if (this.instructions && this.instructions.length > 0) {
    const stepNumbers = this.instructions
      .map((inst) => inst.stepNumber)
      .sort((a, b) => a - b)
    for (let i = 0; i < stepNumbers.length; i++) {
      if (stepNumbers[i] !== i + 1) {
        return next(
          new Error(
            "Instruction step numbers must be sequential starting from 1"
          )
        )
      }
    }
  }

  // Prevent duplicate ratings from same user
  if (this.ratings && this.ratings.length > 0) {
    const userIds = this.ratings.map((r) => r.user.toString())
    const uniqueUserIds = [...new Set(userIds)]
    if (userIds.length !== uniqueUserIds.length) {
      return next(
        new Error("A user cannot rate the same recipe multiple times")
      )
    }
  }

  // Image validation
  if (this.image && this.image.startsWith("data:image/")) {
    const base64Data = this.image.split(",")[1]
    if (base64Data) {
      const sizeInBytes = (base64Data.length * 3) / 4
      const sizeInMB = sizeInBytes / (1024 * 1024)
      if (sizeInMB > 5) {
        return next(new Error("Image size cannot exceed 5MB"))
      }
    }
  }

  next()
})

// Auto-calculate scores before saving
recipeSchema.pre("save", function (next) {
  this.calculateHealthScore()
  this.updateAverageRating()
  next()
})

// Virtual for total time
recipeSchema.virtual("totalTime").get(function () {
  return this.prepTime + this.cookTime
})

// Calculate health score
recipeSchema.methods.calculateHealthScore = function () {
  let score = 50

  const matchingTags = this.dietaryTags.filter((tag) =>
    HEALTHY_TAGS.includes(tag)
  )
  score += matchingTags.length * 5

  if (this.nutrition) {
    if (this.nutrition.fiber > 5) score += 10
    if (this.nutrition.protein > 15) score += 10
    if (this.nutrition.sodium < 600) score += 5
    if (this.nutrition.sugar < 10) score += 5
    if (this.nutrition.saturatedFat && this.nutrition.saturatedFat < 5)
      score += 5
    if (this.nutrition.transFat === 0) score += 10
  }

  this.healthScore = Math.min(Math.max(score, 0), 100)
  return this.healthScore
}

// Update average rating
recipeSchema.methods.updateAverageRating = function () {
  if (this.ratings.length === 0) {
    this.averageRating = 0
    this.totalRatings = 0
  } else {
    const sum = this.ratings.reduce((acc, rating) => acc + rating.rating, 0)
    this.averageRating = Math.round((sum / this.ratings.length) * 10) / 10
    this.totalRatings = this.ratings.length
  }
}

// Add rating with validation
recipeSchema.methods.addRating = function (userId, rating, comment = "") {
  const existingRating = this.ratings.find(
    (r) => r.user.toString() === userId.toString()
  )
  if (existingRating) {
    throw new Error("User has already rated this recipe")
  }

  this.ratings.push({
    user: userId,
    rating: rating,
    comment: comment,
  })

  this.updateAverageRating()
  return this.save()
}

// Update image safely
recipeSchema.methods.updateImage = function (
  imageUrl,
  altText = "",
  publicId = null
) {
  if (
    imageUrl &&
    !/^(https?:\/\/.+|data:image\/.+|\/uploads\/.+|\/recipe-images\/.+)/.test(
      imageUrl
    )
  ) {
    throw new Error("Invalid image URL format")
  }

  this.image = imageUrl
  this.imageAltText = altText
  if (publicId) {
    this.imagePublicId = publicId
  }

  return this.save()
}

// Remove image
recipeSchema.methods.removeImage = function () {
  this.image = null
  this.imageAltText = null
  this.imagePublicId = null
  return this.save()
}

// Get author profile
recipeSchema.methods.getAuthorProfile = function () {
  return this.model("User")
    .findById(this.author)
    .select("username email profileImage bio createdAt")
    .exec()
}

// Track profile views
recipeSchema.methods.incrementAuthorProfileViews = function () {
  return this.model("User").findByIdAndUpdate(
    this.author,
    { $inc: { profileViews: 1 } },
    { new: true }
  )
}

// Indexes
recipeSchema.index({ title: "text", description: "text" })
recipeSchema.index({ category: 1 })
recipeSchema.index({ author: 1 })
recipeSchema.index({ dietaryTags: 1 })
recipeSchema.index({ averageRating: -1 })
recipeSchema.index({ createdAt: -1 })
recipeSchema.index({ healthScore: -1 })
recipeSchema.index({ isPublished: 1, isFeatured: -1 })
recipeSchema.index({ "ratings.user": 1 })

recipeSchema.set("toJSON", { virtuals: true })

module.exports = mongoose.model("Recipe", recipeSchema)
