const mongoose = require("mongoose")

const categorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      maxlength: 50,
    },
    description: {
      type: String,
      maxlength: 200,
    },
    icon: {
      type: String, // emoji or icon class
      default: "🍽️",
    },
    color: {
      type: String, // hex color code
      default: "#4A90E2",
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    recipeCount: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
)

// Update recipe count when recipes are added/removed
categorySchema.methods.updateRecipeCount = async function () {
  const Recipe = mongoose.model("Recipe")
  this.recipeCount = await Recipe.countDocuments({
    category: this._id,
    isPublished: true,
  })
  return this.save()
}

module.exports = mongoose.model("Category", categorySchema)
