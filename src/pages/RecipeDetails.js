import React, { useState, useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"
import {
  FiClock,
  FiUsers,
  FiHeart,
  FiArrowLeft,
  FiPlus,
  FiCheckCircle,
} from "react-icons/fi"
import { useRecipes } from "../hooks/useRecipes"
import "./RecipeDetails.css"

const RecipeDetails = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const {
    getRecipe,
    addToFavorites,
    removeFromFavorites,
    isFavorite: checkFavorite,
  } = useRecipes()
  const [recipe, setRecipe] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [isFavorite, setIsFavorite] = useState(false)
  const [servings, setServings] = useState(1)

  useEffect(() => {
    const fetchRecipe = async () => {
      try {
        setLoading(true)
        setError(null)
        const recipeData = await getRecipe(id)

        if (recipeData) {
          setRecipe(recipeData)
          setServings(recipeData.servings)

          // Check if recipe is favorited
          const favoriteStatus = await checkFavorite(parseInt(id))
          setIsFavorite(favoriteStatus)
        } else {
          setError("Recipe not found")
        }
      } catch (err) {
        console.error("Error fetching recipe:", err)
        setError("Failed to load recipe")
      } finally {
        setLoading(false)
      }
    }

    if (id) {
      fetchRecipe()
    }
  }, [id, getRecipe, checkFavorite])

  const handleFavoriteToggle = async () => {
    try {
      if (isFavorite) {
        const success = await removeFromFavorites(parseInt(recipe.id))
        if (success) {
          setIsFavorite(false)
        }
      } else {
        const success = await addToFavorites(parseInt(recipe.id))
        if (success) {
          setIsFavorite(true)
        }
      }
    } catch (err) {
      console.error("Error toggling favorite:", err)
    }
  }

  const handleServingsChange = (newServings) => {
    if (newServings > 0) {
      setServings(newServings)
    }
  }

  const getAdjustedAmount = (originalAmount, originalServings) => {
    const multiplier = servings / originalServings
    const match = originalAmount.match(/^(\d+(?:\.\d+)?)\s*(.*)$/)

    if (match) {
      const amount = parseFloat(match[1])
      const unit = match[2]
      const adjustedAmount = (amount * multiplier)
        .toFixed(2)
        .replace(/\.?0+$/, "")
      return `${adjustedAmount} ${unit}`
    }

    return originalAmount
  }

  if (loading) {
    return (
      <div className="loading">
        <div className="spinner"></div>
        <p>Loading recipe...</p>
      </div>
    )
  }

  if (error || !recipe) {
    return (
      <div className="error-page">
        <h2>{error || "Recipe not found"}</h2>
        <button
          onClick={() => navigate("/recipes")}
          className="btn btn-primary"
        >
          Back to Recipes
        </button>
      </div>
    )
  }

  return (
    <div className="recipe-details">
      <div className="container">
        {/* Header */}
        <div className="recipe-header">
          <button onClick={() => navigate("/recipes")} className="back-btn">
            <FiArrowLeft /> Back to Recipes
          </button>

          <div className="recipe-hero">
            <div className="recipe-image-large">
              <span className="recipe-emoji-large">{recipe.image}</span>
            </div>

            <div className="recipe-info">
              <div className="recipe-badges">
                {recipe.tags.map((tag) => (
                  <span key={tag} className="tag">
                    {tag}
                  </span>
                ))}
              </div>

              <h1 className="recipe-title">{recipe.title}</h1>
              <p className="recipe-description">{recipe.description}</p>

              <div className="recipe-meta">
                <div className="meta-item">
                  <FiClock />
                  <span>{recipe.cookingTime} min</span>
                </div>
                <div className="meta-item">
                  <FiUsers />
                  <span>{recipe.servings} servings</span>
                </div>
                <div className="meta-item calories">
                  <span>
                    {recipe.nutrition?.calories || recipe.calories} cal
                  </span>
                </div>
                <div className="meta-item">
                  <span>
                    ⭐ {recipe.rating}{" "}
                    {recipe.reviews ? `(${recipe.reviews} reviews)` : ""}
                  </span>
                </div>
              </div>

              <div className="recipe-actions">
                <button
                  onClick={handleFavoriteToggle}
                  className={`btn btn-outline ${isFavorite ? "favorited" : ""}`}
                >
                  <FiHeart /> {isFavorite ? "Favorited" : "Add to Favorites"}
                </button>
                <button className="btn btn-primary">
                  <FiPlus /> Add to Meal Plan
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="recipe-content">
          {/* Nutrition Info */}
          <div className="nutrition-card">
            <h3>Nutrition Facts</h3>
            <div className="nutrition-grid">
              <div className="nutrition-item">
                <span className="nutrition-value">
                  {Math.round(
                    ((recipe.nutrition?.calories || recipe.calories) *
                      servings) /
                      recipe.servings
                  )}
                </span>
                <span className="nutrition-label">Calories</span>
              </div>
              {recipe.nutrition && (
                <>
                  <div className="nutrition-item">
                    <span className="nutrition-value">
                      {Math.round(
                        (recipe.nutrition.protein * servings) / recipe.servings
                      )}
                      g
                    </span>
                    <span className="nutrition-label">Protein</span>
                  </div>
                  <div className="nutrition-item">
                    <span className="nutrition-value">
                      {Math.round(
                        (recipe.nutrition.carbs * servings) / recipe.servings
                      )}
                      g
                    </span>
                    <span className="nutrition-label">Carbs</span>
                  </div>
                  <div className="nutrition-item">
                    <span className="nutrition-value">
                      {Math.round(
                        (recipe.nutrition.fat * servings) / recipe.servings
                      )}
                      g
                    </span>
                    <span className="nutrition-label">Fat</span>
                  </div>
                  <div className="nutrition-item">
                    <span className="nutrition-value">
                      {Math.round(
                        (recipe.nutrition.fiber * servings) / recipe.servings
                      )}
                      g
                    </span>
                    <span className="nutrition-label">Fiber</span>
                  </div>
                  <div className="nutrition-item">
                    <span className="nutrition-value">
                      {Math.round(
                        (recipe.nutrition.sodium * servings) / recipe.servings
                      )}
                      mg
                    </span>
                    <span className="nutrition-label">Sodium</span>
                  </div>
                </>
              )}
            </div>
          </div>

          <div className="recipe-main">
            {/* Ingredients */}
            {recipe.ingredients && recipe.ingredients.length > 0 && (
              <div className="ingredients-section">
                <div className="section-header">
                  <h3>Ingredients</h3>
                  <div className="servings-adjuster">
                    <span>Servings:</span>
                    <button
                      onClick={() => handleServingsChange(servings - 1)}
                      className="serving-btn"
                    >
                      -
                    </button>
                    <span className="serving-count">{servings}</span>
                    <button
                      onClick={() => handleServingsChange(servings + 1)}
                      className="serving-btn"
                    >
                      +
                    </button>
                  </div>
                </div>

                <div className="ingredients-list">
                  {recipe.ingredients.map((ingredient, index) => (
                    <div key={index} className="ingredient-item">
                      <input type="checkbox" id={`ingredient-${index}`} />
                      <label htmlFor={`ingredient-${index}`}>
                        <span className="ingredient-amount">
                          {getAdjustedAmount(
                            ingredient.amount,
                            recipe.servings
                          )}
                        </span>
                        <span className="ingredient-name">
                          {ingredient.name}
                        </span>
                      </label>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Instructions */}
            {recipe.instructions && recipe.instructions.length > 0 && (
              <div className="instructions-section">
                <h3>Instructions</h3>
                <div className="instructions-list">
                  {recipe.instructions.map((instruction, index) => (
                    <div key={index} className="instruction-item">
                      <div className="instruction-number">{index + 1}</div>
                      <div className="instruction-text">{instruction}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Tips */}
          {recipe.tips && recipe.tips.length > 0 && (
            <div className="tips-section">
              <h3>Chef's Tips</h3>
              <div className="tips-list">
                {recipe.tips.map((tip, index) => (
                  <div key={index} className="tip-item">
                    <FiCheckCircle className="tip-icon" />
                    <p>{tip}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default RecipeDetails
