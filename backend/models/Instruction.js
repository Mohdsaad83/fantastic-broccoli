const mongoose = require("mongoose")

const instructionSchema = new mongoose.Schema({
  stepNumber: {
    type: Number,
    required: [true, "Step number is required"],
    min: [1, "Step number must be at least 1"],
  },
  instruction: {
    type: String,
    required: [true, "Instruction text is required"],
    trim: true,
    minlength: [10, "Instruction must be at least 10 characters"],
    maxlength: [1000, "Instruction cannot exceed 1000 characters"],
  },
  estimatedTime: {
    type: Number, // in minutes
    default: 0,
    min: [0, "Estimated time cannot be negative"],
  },
})

module.exports = instructionSchema
