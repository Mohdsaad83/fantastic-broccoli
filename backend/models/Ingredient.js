const mongoose = require("mongoose")

const ingredientSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Ingredient name is required"],
    trim: true,
    maxlength: [100, "Ingredient name cannot exceed 100 characters"],
  },
  amount: {
    type: Number,
    required: [true, "Ingredient amount is required"],
    min: [0.001, "Amount must be greater than 0"],
  },
  unit: {
    type: String,
    required: [true, "Ingredient unit is required"],
    enum: {
      values: [
        "cup",
        "tbsp",
        "tsp",
        "oz",
        "lb",
        "g",
        "kg",
        "ml",
        "l",
        "piece",
        "clove",
        "slice",
        "pinch",
        "dash",
      ],
      message: "{VALUE} is not a valid unit",
    },
  },
  notes: {
    type: String,
    default: "",
    maxlength: [200, "Notes cannot exceed 200 characters"],
  },
})

module.exports = ingredientSchema
