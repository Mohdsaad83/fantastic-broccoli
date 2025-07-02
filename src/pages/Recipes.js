import React, { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import { FiClock, FiUsers } from "react-icons/fi"
import { useRecipes } from "../hooks/useRecipes"

const Recipes = () => {
  const { recipes, loading, error, fetchRecipes, clearError } = useRecipes()

  const [filteredRecipes, setFilteredRecipes] = useState([])
  const [selectedCategory] = useState("all")
  const [maxCalories] = useState(1000)
  const [recipesToShow, setRecipesToShow] = useState(12)

  useEffect(() => {
    // Fetch recipes when component mounts
    fetchRecipes()
  }, [fetchRecipes])

  useEffect(() => {
    let filtered = recipes

    // Filter by category
    if (selectedCategory !== "all") {
      filtered = filtered.filter(
        (recipe) => recipe.category === selectedCategory
      )
    }

    // Filter by calories (only if recipe has calories data)
    filtered = filtered.filter((recipe) => {
      const recipeCalories =
        recipe.calories || (recipe.nutrition && recipe.nutrition.calories)
      return !recipeCalories || recipeCalories <= maxCalories
    })

    setFilteredRecipes(filtered)
  }, [recipes, selectedCategory, maxCalories])

  if (loading) {
    return (
      <div className="loading">
        <div className="spinner"></div>
        <p>Loading delicious recipes...</p>
      </div>
    )
  }

  return (
    <div className="recipes-page glassmorphism-bg">
      <div className="container">
        {error && (
          <div className="error-banner">
            <p>⚠️ {error}</p>
            <button onClick={clearError} className="close-error">
              ×
            </button>
          </div>
        )}

        <div
          className="page-header glassmorphism"
          style={{
            display: "flex",
            alignItems: "center",
            gap: "1.2rem",
            justifyContent: "center",
            flexWrap: "wrap",
          }}
        >
          <span
            style={{
              fontSize: "2.5rem",
              lineHeight: 1,
              marginRight: "0.5rem",
              fontFamily: "Nunito, Inter, sans-serif",
            }}
          >
            🥦
          </span>
          <h1
            className="page-title"
            style={{
              fontFamily: "Nunito, Inter, sans-serif",
              fontWeight: 900,
              fontSize: "2.3rem",
              letterSpacing: "0.01em",
              margin: 0,
              color: "#059669",
              textShadow: "0 2px 8px #10b98122, 0 1px 0 #fff",
            }}
          >
            Fantastic Broccoli
          </h1>
        </div>

        {/* Recipes Grid */}
        <div className="recipes-grid modern-grid">
          {filteredRecipes.slice(0, recipesToShow).map((recipe) => (
            <Link
              to={`/recipes/${recipe.id || recipe._id}`}
              key={recipe.id || recipe._id}
              className="recipe-card glassmorphism"
            >
              <div className="recipe-image">
                <img
                  src={`/recipe-images/${
                    recipe.image || recipe.title + ".jpg"
                  }`}
                  alt={recipe.title}
                  className="recipe-img"
                  loading="lazy"
                  onError={(e) => {
                    e.target.onerror = null
                    e.target.style.display = "none"
                    e.target.nextElementSibling.style.display = "flex"
                  }}
                />
                <span className="recipe-emoji" style={{ display: "none" }}>
                  🥦
                </span>
              </div>

              <div className="recipe-content">
                <h3 className="recipe-title highlight">{recipe.title}</h3>
                <p className="recipe-description">{recipe.description}</p>

                <div className="recipe-meta">
                  <div className="meta-item">
                    <FiClock />
                    <span>
                      {recipe.cookingTime ||
                        recipe.totalTime ||
                        recipe.cookTime}
                      min
                    </span>
                  </div>
                  <div className="meta-item">
                    <FiUsers />
                    <span>{recipe.servings} servings</span>
                  </div>
                  <div className="meta-item calories">
                    <span>
                      {recipe.calories ||
                        (recipe.nutrition && recipe.nutrition.calories)}{" "}
                      cal
                    </span>
                  </div>
                </div>

                <div className="recipe-tags">
                  {(recipe.tags || recipe.dietaryTags || [])
                    .slice(0, 3)
                    .map((tag) => (
                      <span key={tag} className="tag">
                        {tag}
                      </span>
                    ))}
                </div>

                <div className="recipe-footer">
                  <div className="difficulty">
                    <span
                      className={`difficulty-badge ${
                        recipe.difficulty
                          ? recipe.difficulty.toLowerCase()
                          : "unknown"
                      }`}
                    >
                      {recipe.difficulty || "Unknown"}
                    </span>
                  </div>
                  <div className="rating">
                    <span>⭐ {recipe.rating || recipe.averageRating || 0}</span>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {recipesToShow < filteredRecipes.length && (
          <div style={{ textAlign: "center", margin: "2rem 0" }}>
            <button
              className="btn btn-outline"
              onClick={() => setRecipesToShow((prev) => prev + 12)}
            >
              Show More
            </button>
          </div>
        )}

        {filteredRecipes.length === 0 && (
          <div className="no-results glassmorphism">
            <h3>No recipes found</h3>
            <p>Try adjusting your search terms or filters</p>
          </div>
        )}
      </div>
    </div>
  )
}

export default Recipes
