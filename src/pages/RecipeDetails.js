import React, { useState, useEffect } from "react"
import { useParams, useNavigate, Link } from "react-router-dom"
import {
  FiClock,
  FiUsers,
  FiHeart,
  FiArrowLeft,
  FiCheckCircle,
  FiEdit,
  FiTrash2,
} from "react-icons/fi"
import { useRecipes } from "../hooks/useRecipes"
import { useAuth } from "../contexts/Auth"
import "./RecipeDetails.css"

const RecipeDetails = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const {
    getRecipe,
    addToFavorites,
    removeFromFavorites,
    isFavorite: checkFavorite,
    deleteRecipe,
  } = useRecipes()
  const [recipe, setRecipe] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [isFavorite, setIsFavorite] = useState(false)
  const [servings, setServings] = useState(1)
  const [isOwner, setIsOwner] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

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
          const favoriteStatus = await checkFavorite(
            recipeData._id || recipeData.id
          )
          setIsFavorite(favoriteStatus)

          // Check if the current user is the recipe owner
          if (
            user &&
            recipeData.author &&
            (user._id === recipeData.author._id ||
              user.id === recipeData.author._id ||
              user._id === recipeData.author ||
              user.id === recipeData.author)
          ) {
            setIsOwner(true)
          }
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
  }, [id, getRecipe, checkFavorite, user])

  const handleFavoriteToggle = async () => {
    try {
      const recipeId = recipe._id || recipe.id
      if (isFavorite) {
        const success = await removeFromFavorites(recipeId)
        if (success) {
          setIsFavorite(false)
        }
      } else {
        const success = await addToFavorites(recipeId)
        if (success) {
          setIsFavorite(true)
        }
      }
    } catch (err) {
      console.error("Error toggling favorite:", err)
    }
  }

  // Handle delete recipe
  const handleDeleteRecipe = async () => {
    if (
      window.confirm(
        "Are you sure you want to delete this recipe? This action cannot be undone."
      )
    ) {
      setIsDeleting(true)
      try {
        const result = await deleteRecipe(id)
        if (result.success) {
          navigate("/profile")
        } else {
          setError(result.error || "Failed to delete recipe")
        }
      } catch (err) {
        console.error("Error deleting recipe:", err)
        setError("Failed to delete recipe")
      } finally {
        setIsDeleting(false)
      }
    }
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
          <button onClick={() => navigate(-1)} className="btn btn-outline">
            <FiArrowLeft /> Back
          </button>

          <div className="recipe-hero">
            <div className="recipe-image-large">
              <img
                src={`/recipe-images/${recipe.image || `${recipe.title}.jpg`}`}
                alt={recipe.imageAltText || recipe.title}
                className="recipe-img"
                onError={(e) => {
                  e.target.onerror = null
                  e.target.style.display = "none"
                  e.target.parentNode.querySelector(
                    ".recipe-name-placeholder"
                  ).style.display = "flex"
                }}
              />
              <span
                className="recipe-name-placeholder"
                style={{ display: recipe.image ? "none" : "flex" }}
              >
                {recipe.title}
              </span>
            </div>

            <div className="recipe-info">
              <div className="recipe-badges">
                {recipe.tags &&
                  recipe.tags.length > 0 &&
                  recipe.tags.map((tag) => (
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

                {/* Edit and Delete buttons for recipe owner */}
                {isOwner && (
                  <div className="owner-actions">
                    <Link
                      to={`/edit-recipe/${recipe._id || recipe.id}`}
                      className="btn btn-outline edit-btn"
                    >
                      <FiEdit /> Edit Recipe
                    </Link>
                    <button
                      onClick={handleDeleteRecipe}
                      className="btn btn-outline delete-btn"
                      disabled={isDeleting}
                    >
                      <FiTrash2 />{" "}
                      {isDeleting ? "Deleting..." : "Delete Recipe"}
                    </button>
                  </div>
                )}
                {isOwner && (
                  <div className="owner-actions">
                    <Link
                      to={`/edit-recipe/${recipe._id || recipe.id}`}
                      className="btn btn-edit"
                    >
                      <FiEdit /> Edit Recipe
                    </Link>
                    <button
                      className="btn btn-delete"
                      onClick={handleDeleteRecipe}
                      disabled={isDeleting}
                    >
                      {isDeleting ? (
                        <>
                          <span className="spinner-border spinner-border-sm"></span>
                          Deleting...
                        </>
                      ) : (
                        <>
                          <FiTrash2 /> Delete Recipe
                        </>
                      )}
                    </button>
                  </div>
                )}
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
            {/* Instructions */}
            {recipe.instructions && recipe.instructions.length > 0 && (
              <div className="instructions-section">
                <h3>Instructions</h3>
                <div className="instructions-list">
                  {recipe.instructions &&
                    recipe.instructions.length > 0 &&
                    recipe.instructions.map((instruction, index) => (
                      <div key={index} className="instruction-item">
                        <div className="instruction-number">{index + 1}</div>
                        <div className="instruction-text">
                          {typeof instruction === "string"
                            ? instruction
                            : instruction.instruction}
                        </div>
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
