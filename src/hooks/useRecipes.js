import { useState, useCallback } from "react"
import recipesAPI from "../services/recipesAPI"

export const useRecipes = () => {
  const [recipes, setRecipes] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  // Fetch all recipes from database
  const fetchRecipes = useCallback(async (params = {}) => {
    setLoading(true)
    setError(null)

    try {
      const result = await recipesAPI.getRecipes(params)

      if (result.success) {
        setRecipes(result.data)
      } else {
        setError(result.error || "Failed to fetch recipes")
        setRecipes([])
      }
    } catch (err) {
      setError("Failed to fetch recipes")
      setRecipes([])
    } finally {
      setLoading(false)
    }
  }, [])

  // Get single recipe by ID from database
  const getRecipe = useCallback(async (id) => {
    try {
      const result = await recipesAPI.getRecipeById(id)

      if (result.success) {
        return result.data
      } else {
        throw new Error(result.error || "Recipe not found")
      }
    } catch (err) {
      throw new Error("Failed to fetch recipe")
    }
  }, [])

  // Add recipe to favorites
  const addToFavorites = useCallback(async (recipeId) => {
    try {
      const result = await recipesAPI.addToFavorites(recipeId)
      return result.success
    } catch (err) {
      console.error("Error adding to favorites:", err)
      return false
    }
  }, [])

  // Remove recipe from favorites
  const removeFromFavorites = useCallback(async (recipeId) => {
    try {
      const result = await recipesAPI.removeFromFavorites(recipeId)
      return result.success
    } catch (err) {
      console.error("Error removing from favorites:", err)
      return false
    }
  }, [])

  // Check if recipe is in favorites
  const isFavorite = useCallback(async (recipeId) => {
    try {
      const result = await recipesAPI.isFavorite(recipeId)
      return result.success ? result.data.isFavorite : false
    } catch (err) {
      console.error("Error checking favorite status:", err)
      return false
    }
  }, [])

  // Get user's favorite recipes
  const getFavorites = useCallback(async () => {
    try {
      const result = await recipesAPI.getFavorites()
      return result.success ? result.data : []
    } catch (err) {
      console.error("Error fetching favorites:", err)
      return []
    }
  }, [])

  // Create a new recipe
  const createRecipe = useCallback(
    async (recipeData) => {
      try {
        const result = await recipesAPI.createRecipe(recipeData)
        if (result.success) {
          // Refresh recipes list if needed
          await fetchRecipes()
        }
        return result
      } catch (err) {
        console.error("Error creating recipe:", err)
        return {
          success: false,
          error: err.message || "Failed to create recipe",
        }
      }
    },
    [fetchRecipes]
  )

  // Update an existing recipe
  const updateRecipe = useCallback(
    async (recipeId, recipeData) => {
      try {
        const result = await recipesAPI.updateRecipe(recipeId, recipeData)
        if (result.success) {
          // Refresh recipes list if needed
          await fetchRecipes()
        }
        return result
      } catch (err) {
        console.error("Error updating recipe:", err)
        return {
          success: false,
          error: err.message || "Failed to update recipe",
        }
      }
    },
    [fetchRecipes]
  )

  // Delete a recipe
  const deleteRecipe = useCallback(
    async (recipeId) => {
      try {
        const result = await recipesAPI.deleteRecipe(recipeId)
        if (result.success) {
          // Refresh recipes list
          await fetchRecipes()
        }
        return result
      } catch (err) {
        console.error("Error deleting recipe:", err)
        return {
          success: false,
          error: err.message || "Failed to delete recipe",
        }
      }
    },
    [fetchRecipes]
  )

  // Get user's own recipes
  const getUserRecipes = useCallback(async () => {
    setLoading(true)
    setError(null)

    try {
      const result = await recipesAPI.getUserRecipes()
      if (result.success) {
        return result.data
      } else {
        setError(result.error || "Failed to fetch your recipes")
        return []
      }
    } catch (err) {
      setError("Failed to fetch your recipes")
      return []
    } finally {
      setLoading(false)
    }
  }, [])

  // Get all categories
  const getCategories = useCallback(async () => {
    try {
      const result = await recipesAPI.getCategories()
      return result.success ? result.data : []
    } catch (err) {
      console.error("Error fetching categories:", err)
      return []
    }
  }, [])

  // Clear error
  const clearError = useCallback(() => {
    setError(null)
  }, [])

  return {
    recipes,
    loading,
    error,
    fetchRecipes,
    getRecipe,
    addToFavorites,
    removeFromFavorites,
    isFavorite,
    getFavorites,
    getCategories,
    createRecipe,
    updateRecipe,
    deleteRecipe,
    getUserRecipes,
    getCategories,
    clearError,
  }
}
