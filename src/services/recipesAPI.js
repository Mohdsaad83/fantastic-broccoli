import api from "./api"

class RecipesAPI {
  // Get all recipes with optional filters
  async getRecipes(params = {}) {
    try {
      const response = await api.get("/recipes", { params })
      const recipes = response.data.recipes || response.data || []

      return {
        success: true,
        data: Array.isArray(recipes) ? recipes : [],
      }
    } catch (error) {
      console.error("❌ Failed to fetch recipes from database:", error)
      console.error("❌ Error details:", error.response?.data)
      return {
        success: false,
        error: error.response?.data?.message || "Failed to fetch recipes",
        data: [],
      }
    }
  }

  // Get a single recipe by ID
  async getRecipeById(id) {
    try {
      const response = await api.get(`/recipes/${id}`)
      const recipe = response.data.recipe || response.data

      const transformedRecipe = {
        ...recipe,
        id: recipe._id || recipe.id,
        tags: recipe.dietaryTags || recipe.tags || [],
        tips: recipe.tips || [],
        image: recipe.image || "🍽️",
        ingredients: recipe.ingredients || [],
        instructions: recipe.instructions || [],
        rating: recipe.averageRating || 0,
        reviews: recipe.totalRatings || 0,
        cookingTime: (recipe.prepTime || 0) + (recipe.cookTime || 0),
        nutrition: recipe.nutrition || {},
      }

      return {
        success: true,
        data: transformedRecipe,
      }
    } catch (error) {
      console.error("Failed to fetch recipe from database:", error)
      return {
        success: false,
        error: error.response?.data?.message || "Recipe not found",
        data: null,
      }
    }
  }

  // Search recipes
  async searchRecipes(searchTerm, filters = {}) {
    try {
      const params = {
        search: searchTerm,
        ...filters,
      }
      const response = await api.get("/recipes/search", { params })
      return {
        success: true,
        data: response.data,
      }
    } catch (error) {
      console.error("Failed to search recipes:", error)
      return {
        success: false,
        error: error.response?.data?.message || "Search failed",
        data: [],
      }
    }
  }

  // Get recipes by category
  async getRecipesByCategory(category) {
    try {
      const response = await api.get(`/recipes/category/${category}`)
      return {
        success: true,
        data: response.data,
      }
    } catch (error) {
      console.error("Failed to fetch recipes by category:", error)
      return {
        success: false,
        error: error.response?.data?.message || "Failed to fetch recipes",
        data: [],
      }
    }
  }

  // Get featured/popular recipes
  async getFeaturedRecipes() {
    try {
      const response = await api.get("/recipes/featured")
      return {
        success: true,
        data: response.data,
      }
    } catch (error) {
      console.error("Failed to fetch featured recipes:", error)
      return {
        success: false,
        error:
          error.response?.data?.message || "Failed to fetch featured recipes",
        data: [],
      }
    }
  }

  // Add recipe to favorites
  async addToFavorites(recipeId) {
    try {
      const response = await api.post(`/recipes/${recipeId}/favorite`)
      return {
        success: true,
        data: response.data,
      }
    } catch (error) {
      console.error("Failed to add to favorites:", error)
      return {
        success: false,
        error: error.response?.data?.message || "Failed to add to favorites",
      }
    }
  }

  // Remove recipe from favorites
  async removeFromFavorites(recipeId) {
    try {
      const response = await api.delete(`/recipes/${recipeId}/favorite`)
      return {
        success: true,
        data: response.data,
      }
    } catch (error) {
      console.error("Failed to remove from favorites:", error)
      return {
        success: false,
        error:
          error.response?.data?.message || "Failed to remove from favorites",
      }
    }
  }

  // Check if recipe is in favorites
  async isFavorite(recipeId) {
    try {
      const response = await api.get(`/recipes/${recipeId}/favorite`)
      return {
        success: true,
        data: response.data,
      }
    } catch (error) {
      console.error("Failed to check favorite status:", error)
      return {
        success: false,
        error:
          error.response?.data?.message || "Failed to check favorite status",
        data: { isFavorite: false },
      }
    }
  }

  // Get user's favorite recipes
  async getFavorites() {
    try {
      const response = await api.get("/api/recipes/favorites")
      return {
        success: true,
        data: response.data.favorites || [],
      }
    } catch (error) {
      console.error("Failed to fetch favorites:", error)
      return {
        success: false,
        error: error.response?.data?.message || "Failed to fetch favorites",
        data: [],
      }
    }
  }

  // Rate a recipe
  async rateRecipe(recipeId, rating) {
    try {
      const response = await api.post(`/api/recipes/${recipeId}/ratings`, {
        rating,
      })
      return {
        success: true,
        data: response.data,
      }
    } catch (error) {
      console.error("Failed to rate recipe:", error)
      return {
        success: false,
        error: error.response?.data?.message || "Failed to rate recipe",
      }
    }
  }

  // Get recipe categories
  async getCategories() {
    try {
      const response = await api.get("/categories")
      return {
        success: true,
        data: response.data.categories || response.data || [],
      }
    } catch (error) {
      console.error("Failed to fetch categories:", error)
      return {
        success: false,
        error: error.response?.data?.error || "Failed to fetch categories",
        data: [],
      }
    }
  }

  // Get recipe tags
  async getTags() {
    try {
      const response = await api.get("/api/recipes/tags")
      return {
        success: true,
        data: response.data,
      }
    } catch (error) {
      console.error("Failed to fetch tags:", error)
      return {
        success: false,
        error: error.response?.data?.message || "Failed to fetch tags",
        data: [],
      }
    }
  }

  // Create a new recipe
  async createRecipe(recipeData) {
    try {
      console.log("Sending recipe data:", recipeData)
      const response = await api.post("/recipes", recipeData)
      return {
        success: true,
        data: response.data.recipe || response.data,
        message: response.data.message || "Recipe created successfully",
      }
    } catch (error) {
      console.error("Failed to create recipe:", error)
      console.error("Error response:", error.response?.data)
      console.error("Error status:", error.response?.status)

      // Log detailed validation errors if available
      if (error.response?.data?.details) {
        console.error("Validation details:", error.response.data.details)
      }

      return {
        success: false,
        error:
          error.response?.data?.error ||
          error.response?.data?.message ||
          "Failed to create recipe",
        details: error.response?.data?.details || null,
      }
    }
  }

  // Update existing recipe
  async updateRecipe(recipeId, recipeData) {
    try {
      const response = await api.put(`/recipes/${recipeId}`, recipeData)
      return {
        success: true,
        data: response.data.recipe || response.data,
        message: response.data.message || "Recipe updated successfully",
      }
    } catch (error) {
      console.error("Failed to update recipe:", error)
      return {
        success: false,
        error: error.response?.data?.error || "Failed to update recipe",
      }
    }
  }

  // Delete recipe
  async deleteRecipe(recipeId) {
    try {
      const response = await api.delete(`/recipes/${recipeId}`)
      return {
        success: true,
        message: response.data.message || "Recipe deleted successfully",
      }
    } catch (error) {
      console.error("Failed to delete recipe:", error)
      return {
        success: false,
        error: error.response?.data?.error || "Failed to delete recipe",
      }
    }
  }

  // Get user's own recipes
  async getUserRecipes() {
    try {
      const response = await api.get("/recipes/user")
      return {
        success: true,
        data: response.data.recipes || response.data || [],
      }
    } catch (error) {
      console.error("Failed to fetch user recipes:", error)
      return {
        success: false,
        error: error.response?.data?.error || "Failed to fetch your recipes",
        data: [],
      }
    }
  }

  // Get all categories
  async getAllCategories() {
    try {
      const response = await api.get("/categories")
      return {
        success: true,
        data: response.data || [],
      }
    } catch (error) {
      console.error("Failed to fetch categories:", error)
      return {
        success: false,
        error: error.response?.data?.error || "Failed to fetch categories",
        data: [],
      }
    }
  }
}

const recipesAPI = new RecipesAPI()
export default recipesAPI
