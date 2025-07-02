const mongoose = require("mongoose")

const nutritionSchema = new mongoose.Schema({
  calories: { type: Number, default: 0, min: 0 },
  protein: { type: Number, default: 0, min: 0 }, // grams
  carbohydrates: { type: Number, default: 0, min: 0 }, // grams
  fat: { type: Number, default: 0, min: 0 }, // grams
  fiber: { type: Number, default: 0, min: 0 }, // grams
  sugar: { type: Number, default: 0, min: 0 }, // grams
  sodium: { type: Number, default: 0, min: 0 }, // milligrams
  cholesterol: { type: Number, default: 0, min: 0 }, // milligrams
  vitaminA: { type: Number, default: 0, min: 0 }, // IU
  vitaminC: { type: Number, default: 0, min: 0 }, // milligrams
  calcium: { type: Number, default: 0, min: 0 }, // milligrams
  iron: { type: Number, default: 0, min: 0 }, // milligrams
  saturatedFat: { type: Number, default: 0, min: 0 }, // grams
  transFat: { type: Number, default: 0, min: 0 }, // grams
  potassium: { type: Number, default: 0, min: 0 }, // milligrams
})

module.exports = nutritionSchema
