import { useState, useCallback } from "react"
import recipesAPI from "../services/recipesAPI"

// Sample fallback data (same as before)
export const sampleRecipes = [
  {
    id: 1,
    title: "Mediterranean Quinoa Bowl",
    description:
      "A nutritious bowl packed with quinoa, fresh vegetables, and Mediterranean flavors.",
    image: "🥗",
    calories: 320,
    cookingTime: 25,
    servings: 2,
    category: "lunch",
    tags: ["vegetarian", "high-protein", "mediterranean"],
    difficulty: "Easy",
    rating: 4.8,
    reviews: 127,
    nutrition: {
      calories: 320,
      protein: 15,
      carbs: 42,
      fat: 8,
      fiber: 6,
      sodium: 450,
    },
    ingredients: [
      { amount: "1 cup", name: "quinoa, rinsed" },
      { amount: "2 cups", name: "vegetable broth" },
      { amount: "1 cup", name: "cherry tomatoes, halved" },
      { amount: "1/2 cup", name: "cucumber, diced" },
      { amount: "1/4 cup", name: "red onion, thinly sliced" },
      { amount: "1/2 cup", name: "Kalamata olives, pitted" },
      { amount: "1/4 cup", name: "feta cheese, crumbled" },
      { amount: "2 tbsp", name: "olive oil" },
      { amount: "1 tbsp", name: "lemon juice" },
      { amount: "1 tsp", name: "dried oregano" },
      { amount: "1/4 cup", name: "fresh parsley, chopped" },
    ],
    instructions: [
      "Rinse quinoa under cold water until water runs clear.",
      "In a medium saucepan, bring vegetable broth to a boil.",
      "Add quinoa, reduce heat to low, cover and simmer for 15 minutes.",
      "Remove from heat and let stand 5 minutes, then fluff with a fork.",
      "Let quinoa cool to room temperature.",
      "In a large bowl, combine cooled quinoa, tomatoes, cucumber, red onion, and olives.",
      "In a small bowl, whisk together olive oil, lemon juice, and oregano.",
      "Pour dressing over quinoa mixture and toss to combine.",
      "Top with feta cheese and fresh parsley before serving.",
    ],
    tips: [
      "For extra flavor, toast the quinoa in a dry pan before cooking.",
      "This bowl tastes even better after sitting for 30 minutes to let flavors meld.",
      "Add grilled chicken or chickpeas for extra protein.",
      "Store leftovers in the refrigerator for up to 3 days.",
    ],
  },
  {
    id: 2,
    title: "Grilled Salmon with Avocado Salsa",
    description:
      "Omega-3 rich salmon paired with fresh avocado salsa for a heart-healthy meal.",
    image: "🐟",
    calories: 380,
    cookingTime: 20,
    servings: 4,
    category: "dinner",
    tags: ["keto", "high-protein", "omega-3"],
    difficulty: "Medium",
    rating: 4.9,
  },
  {
    id: 3,
    title: "Green Smoothie Power Bowl",
    description:
      "Energizing smoothie bowl with spinach, banana, and superfood toppings.",
    image: "🥤",
    calories: 280,
    cookingTime: 10,
    servings: 1,
    category: "breakfast",
    tags: ["vegan", "smoothie", "antioxidants"],
    difficulty: "Easy",
    rating: 4.7,
  },
  {
    id: 4,
    title: "Zucchini Noodles with Pesto",
    description: "Low-carb alternative to pasta with homemade basil pesto.",
    image: "🍝",
    calories: 195,
    cookingTime: 15,
    servings: 2,
    category: "lunch",
    tags: ["low-carb", "vegetarian", "gluten-free"],
    difficulty: "Easy",
    rating: 4.6,
  },
  {
    id: 5,
    title: "Chia Seed Pudding",
    description: "Creamy overnight pudding rich in omega-3s and fiber.",
    image: "🍮",
    calories: 220,
    cookingTime: 5,
    servings: 1,
    category: "dessert",
    tags: ["vegan", "make-ahead", "fiber-rich"],
    difficulty: "Easy",
    rating: 4.5,
  },
  {
    id: 6,
    title: "Turkey and Vegetable Lettuce Wraps",
    description:
      "Light and fresh wraps packed with lean protein and crunchy vegetables.",
    image: "🥬",
    calories: 240,
    cookingTime: 20,
    servings: 4,
    category: "lunch",
    tags: ["low-carb", "high-protein", "gluten-free"],
    difficulty: "Easy",
    rating: 4.4,
  },
  {
    id: 7,
    title: "Overnight Oats with Berries",
    description:
      "Creamy overnight oats topped with fresh berries and nuts for a perfect breakfast.",
    image: "🥣",
    calories: 285,
    cookingTime: 5,
    servings: 1,
    category: "breakfast",
    tags: ["make-ahead", "fiber-rich", "antioxidants"],
    difficulty: "Easy",
    rating: 4.6,
  },
  {
    id: 8,
    title: "Cauliflower Rice Stir-Fry",
    description:
      "Low-carb stir-fry with cauliflower rice, colorful vegetables, and lean protein.",
    image: "🥦",
    calories: 195,
    cookingTime: 18,
    servings: 2,
    category: "dinner",
    tags: ["low-carb", "vegetarian", "quick-meal"],
    difficulty: "Easy",
    rating: 4.3,
  },
  {
    id: 9,
    title: "Greek Yogurt Parfait",
    description:
      "Protein-rich Greek yogurt layered with fresh fruits and granola.",
    image: "🍓",
    calories: 210,
    cookingTime: 5,
    servings: 1,
    category: "breakfast",
    tags: ["high-protein", "probiotics", "quick-prep"],
    difficulty: "Easy",
    rating: 4.7,
  },
  {
    id: 10,
    title: "Baked Sweet Potato with Black Beans",
    description:
      "Nutrient-dense sweet potato topped with seasoned black beans and avocado.",
    image: "🍠",
    calories: 340,
    cookingTime: 45,
    servings: 2,
    category: "lunch",
    tags: ["vegan", "fiber-rich", "complex-carbs"],
    difficulty: "Easy",
    rating: 4.5,
  },
  {
    id: 11,
    title: "Lemon Herb Grilled Chicken",
    description:
      "Tender grilled chicken breast marinated in fresh herbs and lemon.",
    image: "🍗",
    calories: 265,
    cookingTime: 30,
    servings: 4,
    category: "dinner",
    tags: ["high-protein", "lean-meat", "gluten-free"],
    difficulty: "Medium",
    rating: 4.8,
  },
  {
    id: 12,
    title: "Avocado Toast with Poached Egg",
    description:
      "Whole grain toast topped with mashed avocado and a perfectly poached egg.",
    image: "🥑",
    calories: 295,
    cookingTime: 10,
    servings: 1,
    category: "breakfast",
    tags: ["healthy-fats", "protein", "whole-grain"],
    difficulty: "Medium",
    rating: 4.6,
  },
  {
    id: 13,
    title: "Vegetable Soup with Lentils",
    description:
      "Heart-warming soup packed with vegetables, lentils, and aromatic herbs.",
    image: "🍲",
    calories: 185,
    cookingTime: 35,
    servings: 6,
    category: "lunch",
    tags: ["vegan", "fiber-rich", "comfort-food"],
    difficulty: "Easy",
    rating: 4.4,
  },
  {
    id: 14,
    title: "Mixed Berry Smoothie Bowl",
    description:
      "Thick smoothie bowl topped with fresh berries, nuts, and coconut flakes.",
    image: "🫐",
    calories: 245,
    cookingTime: 8,
    servings: 1,
    category: "breakfast",
    tags: ["antioxidants", "vegan", "smoothie"],
    difficulty: "Easy",
    rating: 4.5,
  },
  {
    id: 15,
    title: "Quinoa Stuffed Bell Peppers",
    description:
      "Colorful bell peppers stuffed with quinoa, vegetables, and herbs.",
    image: "🫑",
    calories: 275,
    cookingTime: 40,
    servings: 4,
    category: "dinner",
    tags: ["vegetarian", "high-protein", "colorful"],
    difficulty: "Medium",
    rating: 4.7,
  },
  {
    id: 16,
    title: "Cucumber Hummus Wrap",
    description:
      "Fresh wrap with hummus, cucumber, sprouts, and crisp vegetables.",
    image: "🥒",
    calories: 220,
    cookingTime: 8,
    servings: 1,
    category: "lunch",
    tags: ["vegan", "fresh", "quick-prep"],
    difficulty: "Easy",
    rating: 4.3,
  },
  {
    id: 17,
    title: "Baked Cod with Herbs",
    description: "Flaky white fish baked with fresh herbs and a hint of lemon.",
    image: "🐟",
    calories: 205,
    cookingTime: 25,
    servings: 2,
    category: "dinner",
    tags: ["omega-3", "lean-protein", "low-calorie"],
    difficulty: "Easy",
    rating: 4.6,
  },
  {
    id: 18,
    title: "Energy Balls with Dates",
    description:
      "No-bake energy balls made with dates, nuts, and cocoa powder.",
    image: "🍫",
    calories: 95,
    cookingTime: 15,
    servings: 12,
    category: "snack",
    tags: ["no-bake", "natural-sugar", "energy-boost"],
    difficulty: "Easy",
    rating: 4.4,
  },
  {
    id: 19,
    title: "Spinach and Mushroom Omelet",
    description:
      "Fluffy omelet filled with fresh spinach, mushrooms, and herbs.",
    image: "🍳",
    calories: 235,
    cookingTime: 12,
    servings: 1,
    category: "breakfast",
    tags: ["high-protein", "vegetarian", "iron-rich"],
    difficulty: "Medium",
    rating: 4.5,
  },
  {
    id: 20,
    title: "Roasted Vegetable Medley",
    description:
      "Colorful mix of roasted seasonal vegetables with olive oil and herbs.",
    image: "🥕",
    calories: 165,
    cookingTime: 35,
    servings: 4,
    category: "dinner",
    tags: ["vegan", "colorful", "fiber-rich"],
    difficulty: "Easy",
    rating: 4.3,
  },
  {
    id: 21,
    title: "Apple Cinnamon Protein Bars",
    description: "Homemade protein bars with apple, cinnamon, and oats.",
    image: "🍎",
    calories: 155,
    cookingTime: 25,
    servings: 8,
    category: "snack",
    tags: ["protein", "make-ahead", "natural-sweetness"],
    difficulty: "Medium",
    rating: 4.6,
  },
  {
    id: 22,
    title: "Asian Lettuce Wraps",
    description:
      "Light and flavorful wraps with seasoned ground turkey and water chestnuts.",
    image: "🥬",
    calories: 190,
    cookingTime: 20,
    servings: 4,
    category: "lunch",
    tags: ["low-carb", "asian-inspired", "lean-protein"],
    difficulty: "Medium",
    rating: 4.7,
  },
  {
    id: 23,
    title: "Coconut Curry Chickpeas",
    description:
      "Creamy coconut curry with protein-rich chickpeas and aromatic spices.",
    image: "🍛",
    calories: 310,
    cookingTime: 30,
    servings: 4,
    category: "dinner",
    tags: ["vegan", "curry", "plant-protein"],
    difficulty: "Medium",
    rating: 4.8,
  },
  {
    id: 24,
    title: "Banana Almond Smoothie",
    description:
      "Creamy smoothie with banana, almond butter, and plant-based milk.",
    image: "🍌",
    calories: 225,
    cookingTime: 5,
    servings: 1,
    category: "breakfast",
    tags: ["smoothie", "potassium", "healthy-fats"],
    difficulty: "Easy",
    rating: 4.4,
  },
]

export const useRecipes = () => {
  const [recipes, setRecipes] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  // Fetch all recipes
  const fetchRecipes = useCallback(async (params = {}) => {
    setLoading(true)
    setError(null)

    try {
      const result = await recipesAPI.getRecipes(params)

      if (result.success) {
        setRecipes(result.data)
      } else {
        // Fallback to sample data if API fails
        console.warn("API failed, using sample data:", result.error)
        setRecipes(sampleRecipes)
        setError(result.error)
      }
    } catch (err) {
      console.error("Error in fetchRecipes:", err)
      // Fallback to sample data
      setRecipes(sampleRecipes)
      setError("Failed to fetch recipes from server. Using sample data.")
    } finally {
      setLoading(false)
    }
  }, [])

  // Search recipes
  const searchRecipes = useCallback(async (searchTerm, filters = {}) => {
    setLoading(true)
    setError(null)

    try {
      const result = await recipesAPI.searchRecipes(searchTerm, filters)

      if (result.success) {
        return result.data
      } else {
        // Fallback to local search on sample data
        const filtered = sampleRecipes.filter(
          (recipe) =>
            recipe.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            recipe.description
              .toLowerCase()
              .includes(searchTerm.toLowerCase()) ||
            recipe.tags.some((tag) =>
              tag.toLowerCase().includes(searchTerm.toLowerCase())
            )
        )
        setError(result.error)
        return filtered
      }
    } catch (err) {
      console.error("Error in searchRecipes:", err)
      // Fallback to local search
      const filtered = sampleRecipes.filter(
        (recipe) =>
          recipe.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          recipe.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
          recipe.tags.some((tag) =>
            tag.toLowerCase().includes(searchTerm.toLowerCase())
          )
      )
      setError("Search failed. Using local data.")
      return filtered
    } finally {
      setLoading(false)
    }
  }, [])

  // Get single recipe
  const getRecipe = useCallback(async (id) => {
    setLoading(true)
    setError(null)

    try {
      const result = await recipesAPI.getRecipeById(id)

      if (result.success) {
        return result.data
      } else {
        // Fallback to sample data
        const recipe = sampleRecipes.find((r) => r.id === parseInt(id))
        setError(result.error)
        return recipe || null
      }
    } catch (err) {
      console.error("Error in getRecipe:", err)
      const recipe = sampleRecipes.find((r) => r.id === parseInt(id))
      setError("Failed to fetch recipe from server.")
      return recipe || null
    } finally {
      setLoading(false)
    }
  }, [])

  // Add to favorites
  const addToFavorites = useCallback(async (recipeId) => {
    try {
      const result = await recipesAPI.addToFavorites(recipeId)
      if (!result.success) {
        setError(result.error)
      }
      return result.success
    } catch (err) {
      console.error("Error adding to favorites:", err)
      setError("Failed to add to favorites")
      return false
    }
  }, [])

  // Remove from favorites
  const removeFromFavorites = useCallback(async (recipeId) => {
    try {
      const result = await recipesAPI.removeFromFavorites(recipeId)
      if (!result.success) {
        setError(result.error)
      }
      return result.success
    } catch (err) {
      console.error("Error removing from favorites:", err)
      setError("Failed to remove from favorites")
      return false
    }
  }, [])

  // Check if recipe is favorited
  const isFavorite = useCallback(async (recipeId) => {
    try {
      const result = await recipesAPI.isFavorite(recipeId)
      if (result.success) {
        return result.data.isFavorite
      }
      return false
    } catch (err) {
      console.error("Error checking favorite status:", err)
      return false
    }
  }, [])

  // Get all favorites
  const getFavorites = useCallback(async () => {
    try {
      const result = await recipesAPI.getFavorites()
      if (result.success) {
        return result.data
      }
      return []
    } catch (err) {
      console.error("Error getting favorites:", err)
      return []
    }
  }, [])

  return {
    recipes,
    loading,
    error,
    fetchRecipes,
    searchRecipes,
    getRecipe,
    addToFavorites,
    removeFromFavorites,
    isFavorite,
    getFavorites,
    clearError: () => setError(null),
  }
}
