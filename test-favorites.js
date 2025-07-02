// Test script to debug recipe creation
const recipeData = {
  title: "Test Recipe",
  description: "This is a test recipe for debugging",
  category: "68655f961fe32e0e482c1eb1", // Breakfast category ID from current cloud DB
  servings: 2,
  prepTime: 10,
  cookTime: 15,
  difficulty: "easy",
  ingredients: [
    {
      name: "Test Ingredient",
      amount: "1",
      unit: "cup",
    },
  ],
  instructions: [
    {
      text: "Test instruction step",
    },
  ],
  tags: ["test", "debug"],
  nutrition: {
    calories: 100,
    protein: 5,
    carbs: 10,
    fat: 2,
  },
}

console.log("Recipe data for debugging:")
console.log(JSON.stringify(recipeData, null, 2))
console.log("\nMake sure to use a valid category ID from your database.")
console.log("Current Breakfast category ID: 68655f961fe32e0e482c1eb1")
