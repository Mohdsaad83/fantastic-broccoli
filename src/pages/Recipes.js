import React, { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import { FiSearch, FiFilter, FiClock, FiUsers, FiHeart } from "react-icons/fi"
import { useRecipes } from "../hooks/useRecipes"
import "./Recipes.css"

const Recipes = () => {
  const {
    recipes,
    loading,
    error,
    fetchRecipes,
    addToFavorites,
    removeFromFavorites,
    clearError,
  } = useRecipes()

  const [filteredRecipes, setFilteredRecipes] = useState([])
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [maxCalories, setMaxCalories] = useState(1000)
  const [showFilters, setShowFilters] = useState(false)
  const [favorites, setFavorites] = useState(new Set())

  const categories = [
    { value: "all", label: "All Recipes" },
    { value: "breakfast", label: "Breakfast" },
    { value: "lunch", label: "Lunch" },
    { value: "dinner", label: "Dinner" },
    { value: "snack", label: "Snacks" },
    { value: "dessert", label: "Healthy Desserts" },
  ]

  useEffect(() => {
    // Fetch recipes when component mounts
    fetchRecipes()
  }, [fetchRecipes])

  useEffect(() => {
    let filtered = recipes

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(
        (recipe) =>
          recipe.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          recipe.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
          recipe.tags.some((tag) =>
            tag.toLowerCase().includes(searchTerm.toLowerCase())
          )
      )
    }

    // Filter by category
    if (selectedCategory !== "all") {
      filtered = filtered.filter(
        (recipe) => recipe.category === selectedCategory
      )
    }

    // Filter by calories
    filtered = filtered.filter((recipe) => recipe.calories <= maxCalories)

    setFilteredRecipes(filtered)
  }, [recipes, searchTerm, selectedCategory, maxCalories])

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value)
  }

  const handleCategoryChange = (category) => {
    setSelectedCategory(category)
  }

  const handleCaloriesChange = (e) => {
    setMaxCalories(parseInt(e.target.value))
  }

  const handleFavoriteToggle = async (recipeId, isFavorite) => {
    try {
      if (isFavorite) {
        const success = await removeFromFavorites(recipeId)
        if (success) {
          setFavorites((prev) => {
            const newFavorites = new Set(prev)
            newFavorites.delete(recipeId)
            return newFavorites
          })
        }
      } else {
        const success = await addToFavorites(recipeId)
        if (success) {
          setFavorites((prev) => new Set(prev).add(recipeId))
        }
      }
    } catch (err) {
      console.error("Error toggling favorite:", err)
    }
  }

  if (loading) {
    return (
      <div className="loading">
        <div className="spinner"></div>
        <p>Loading delicious recipes...</p>
      </div>
    )
  }

  return (
    <div className="recipes-page">
      <div className="container">
        {error && (
          <div className="error-banner">
            <p>⚠️ {error}</p>
            <button onClick={clearError} className="close-error">
              ×
            </button>
          </div>
        )}

        <div className="page-header">
          <h1>Healthy Recipes</h1>
          <p>
            Discover nutritious and delicious recipes for your weight loss
            journey
          </p>
        </div>

        {/* Search and Filters */}
        <div className="recipes-controls">
          <div className="search-bar">
            <FiSearch className="search-icon" />
            <input
              type="text"
              placeholder="Search recipes, ingredients, or tags..."
              value={searchTerm}
              onChange={handleSearchChange}
              className="search-input"
            />
          </div>

          <button
            className="filter-toggle"
            onClick={() => setShowFilters(!showFilters)}
          >
            <FiFilter /> Filters
          </button>
        </div>

        {/* Filters Panel */}
        {showFilters && (
          <div className="filters-panel">
            <div className="filter-group">
              <label>Category</label>
              <div className="category-filters">
                {categories.map((category) => (
                  <button
                    key={category.value}
                    className={`category-btn ${
                      selectedCategory === category.value ? "active" : ""
                    }`}
                    onClick={() => handleCategoryChange(category.value)}
                  >
                    {category.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="filter-group">
              <label>Max Calories: {maxCalories}</label>
              <input
                type="range"
                min="100"
                max="800"
                value={maxCalories}
                onChange={handleCaloriesChange}
                className="calories-slider"
              />
            </div>
          </div>
        )}

        {/* Results Count */}
        <div className="results-info">
          <p>{filteredRecipes.length} recipes found</p>
        </div>

        {/* Recipes Grid */}
        <div className="recipes-grid">
          {filteredRecipes.map((recipe) => (
            <Link
              to={`/recipes/${recipe.id}`}
              key={recipe.id}
              className="recipe-card"
            >
              <div className="recipe-image">
                <span className="recipe-emoji">{recipe.image}</span>
                <div className="recipe-overlay">
                  <button
                    className={`favorite-btn ${
                      favorites.has(recipe.id) ? "favorited" : ""
                    }`}
                    onClick={(e) => {
                      e.preventDefault()
                      handleFavoriteToggle(recipe.id, favorites.has(recipe.id))
                    }}
                  >
                    <FiHeart />
                  </button>
                </div>
              </div>

              <div className="recipe-content">
                <h3 className="recipe-title">{recipe.title}</h3>
                <p className="recipe-description">{recipe.description}</p>

                <div className="recipe-meta">
                  <div className="meta-item">
                    <FiClock />
                    <span>{recipe.cookingTime}min</span>
                  </div>
                  <div className="meta-item">
                    <FiUsers />
                    <span>{recipe.servings} servings</span>
                  </div>
                  <div className="meta-item calories">
                    <span>{recipe.calories} cal</span>
                  </div>
                </div>

                <div className="recipe-tags">
                  {recipe.tags.slice(0, 3).map((tag) => (
                    <span key={tag} className="tag">
                      {tag}
                    </span>
                  ))}
                </div>

                <div className="recipe-footer">
                  <div className="difficulty">
                    <span
                      className={`difficulty-badge ${recipe.difficulty.toLowerCase()}`}
                    >
                      {recipe.difficulty}
                    </span>
                  </div>
                  <div className="rating">
                    <span>⭐ {recipe.rating}</span>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {filteredRecipes.length === 0 && (
          <div className="no-results">
            <h3>No recipes found</h3>
            <p>Try adjusting your search terms or filters</p>
          </div>
        )}
      </div>
    </div>
  )
}

export default Recipes
