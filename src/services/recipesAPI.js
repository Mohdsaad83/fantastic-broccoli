import api from "./api"

class RecipesAPI {
  // Get all recipes with optional filters
  async getRecipes(params = {}) {
    try {
      const response = await api.get("/recipes", { params })
      return {
        success: true,
        data: response.data,
      }
    } catch (error) {
      console.error("Error fetching recipes:", error)
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
      return {
        success: true,
        data: response.data,
      }
    } catch (error) {
      console.error("Error fetching recipe:", error)
      return {
        success: false,
        error: error.response?.data?.message || "Failed to fetch recipe",
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
      console.error("Error searching recipes:", error)
      return {
        success: false,
        error: error.response?.data?.message || "Failed to search recipes",
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
      console.error("Error fetching recipes by category:", error)
      return {
        success: false,
        error:
          error.response?.data?.message ||
          "Failed to fetch recipes by category",
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
      console.error("Error fetching featured recipes:", error)
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
      console.log("API call failed, using localStorage for favorites")

      // Fallback to localStorage
      try {
        const favorites = JSON.parse(
          localStorage.getItem("userFavorites") || "[]"
        )
        if (!favorites.includes(recipeId)) {
          favorites.push(recipeId)
          localStorage.setItem("userFavorites", JSON.stringify(favorites))
        }

        return {
          success: true,
          data: { message: "Added to favorites" },
        }
      } catch (localError) {
        console.error("Error saving to localStorage:", localError)
        return {
          success: false,
          error: "Failed to add to favorites",
        }
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
      console.log("API call failed, using localStorage for favorites")

      // Fallback to localStorage
      try {
        const favorites = JSON.parse(
          localStorage.getItem("userFavorites") || "[]"
        )
        const updatedFavorites = favorites.filter((id) => id !== recipeId)
        localStorage.setItem("userFavorites", JSON.stringify(updatedFavorites))

        return {
          success: true,
          data: { message: "Removed from favorites" },
        }
      } catch (localError) {
        console.error("Error removing from localStorage:", localError)
        return {
          success: false,
          error: "Failed to remove from favorites",
        }
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
      console.log("API call failed, checking localStorage for favorites")

      // Fallback to localStorage
      try {
        const favorites = JSON.parse(
          localStorage.getItem("userFavorites") || "[]"
        )
        return {
          success: true,
          data: { isFavorite: favorites.includes(recipeId) },
        }
      } catch (localError) {
        console.error("Error checking localStorage:", localError)
        return {
          success: false,
          error: "Failed to check favorite status",
        }
      }
    }
  }

  // Get all favorite recipes
  async getFavorites() {
    try {
      const response = await api.get("/recipes/favorites")
      return {
        success: true,
        data: response.data,
      }
    } catch (error) {
      console.log("API call failed, getting favorites from localStorage")

      // Fallback to localStorage
      try {
        const favoriteIds = JSON.parse(
          localStorage.getItem("userFavorites") || "[]"
        )
        return {
          success: true,
          data: favoriteIds,
        }
      } catch (localError) {
        console.error("Error getting favorites from localStorage:", localError)
        return {
          success: false,
          error: "Failed to get favorites",
        }
      }
    }
  }

  // Rate a recipe
  async rateRecipe(recipeId, rating) {
    try {
      const response = await api.post(`/recipes/${recipeId}/rate`, { rating })
      return {
        success: true,
        data: response.data,
      }
    } catch (error) {
      console.error("Error rating recipe:", error)
      return {
        success: false,
        error: error.response?.data?.message || "Failed to rate recipe",
      }
    }
  }

  // Get recipe categories
  async getCategories() {
    try {
      const response = await api.get("/recipes/categories")
      return {
        success: true,
        data: response.data,
      }
    } catch (error) {
      console.error("Error fetching categories:", error)
      return {
        success: false,
        error: error.response?.data?.message || "Failed to fetch categories",
        data: [],
      }
    }
  }

  // Get recipe tags
  async getTags() {
    try {
      const response = await api.get("/recipes/tags")
      return {
        success: true,
        data: response.data,
      }
    } catch (error) {
      console.error("Error fetching tags:", error)
      return {
        success: false,
        error: error.response?.data?.message || "Failed to fetch tags",
        data: [],
      }
    }
  }
}

const recipesAPI = new RecipesAPI()
export default recipesAPI
