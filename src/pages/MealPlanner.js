import React, { useState, useEffect, useCallback } from "react"
import { FiPlus, FiTrash2, FiCalendar, FiClock, FiUsers } from "react-icons/fi"
import recipesAPI from "../services/recipesAPI"
import { useAuth } from "../contexts/Auth"

const MealPlanner = () => {
  const { user } = useAuth()
  const [selectedWeek, setSelectedWeek] = useState(new Date())
  const [mealPlan, setMealPlan] = useState({})
  const [availableRecipes, setAvailableRecipes] = useState([])
  const [showRecipeModal, setShowRecipeModal] = useState(false)
  const [selectedSlot, setSelectedSlot] = useState({ day: "", mealType: "" })

  const daysOfWeek = [
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
    "Sunday",
  ]
  const mealTypes = ["breakfast", "lunch", "dinner", "snack"]

  // Get user-specific localStorage key
  const getMealPlanKey = useCallback(() => {
    return user ? `mealPlan_${user.id}` : "mealPlan"
  }, [user])

  useEffect(() => {
    // Fetch real recipes from API
    const fetchRecipes = async () => {
      try {
        const response = await recipesAPI.getRecipes()
        const recipes = response.data || []
        // Transform recipes to match the expected format for meal planning
        const transformedRecipes = recipes.map((recipe) => ({
          id: recipe._id,
          title: recipe.title,
          calories: recipe.nutrition?.calories || 0,
          cookingTime: (recipe.prepTime || 0) + (recipe.cookTime || 0),
          servings: recipe.servings || 1,
          imageUrl:
            recipe.image || recipe.imageUrl || "/recipe-images/default.jpg",
        }))
        setAvailableRecipes(transformedRecipes)
      } catch (error) {
        console.error("Failed to fetch recipes:", error)
        // Keep empty array if fetch fails
        setAvailableRecipes([])
      }
    }

    fetchRecipes()

    // Load saved meal plan from localStorage (user-specific)
    if (user) {
      const savedMealPlan = localStorage.getItem(getMealPlanKey())
      if (savedMealPlan) {
        setMealPlan(JSON.parse(savedMealPlan))
      }
    }
  }, [user, getMealPlanKey])

  const getWeekDates = (startDate) => {
    const week = []
    const start = new Date(startDate)
    start.setDate(start.getDate() - start.getDay() + 1) // Start from Monday

    for (let i = 0; i < 7; i++) {
      const date = new Date(start)
      date.setDate(start.getDate() + i)
      week.push(date)
    }
    return week
  }

  const formatDate = (date) => {
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric" })
  }

  const openRecipeModal = (day, mealType) => {
    setSelectedSlot({ day, mealType })
    setShowRecipeModal(true)
  }

  const addRecipeToMealPlan = (recipe) => {
    if (!selectedSlot.day || !selectedSlot.mealType) {
      console.error("Missing slot information:", selectedSlot)
      alert("Please select a meal slot.")
      return
    }

    const key = `${selectedSlot.day}-${selectedSlot.mealType}`

    const newMealPlan = {
      ...mealPlan,
      [key]: recipe,
    }

    setMealPlan(newMealPlan)
    // Save to user-specific localStorage key
    localStorage.setItem(getMealPlanKey(), JSON.stringify(newMealPlan))
    setShowRecipeModal(false)
    setSelectedSlot({ day: "", mealType: "" }) // Reset slot after adding
  }

  const removeRecipeFromMealPlan = (day, mealType) => {
    const key = `${day}-${mealType}`
    const newMealPlan = { ...mealPlan }
    delete newMealPlan[key]
    setMealPlan(newMealPlan)
    // Save to user-specific localStorage key
    localStorage.setItem(getMealPlanKey(), JSON.stringify(newMealPlan))
  }

  const getTotalCalories = (day) => {
    let total = 0
    mealTypes.forEach((mealType) => {
      const key = `${day}-${mealType}`
      const recipe = mealPlan[key]
      if (recipe) {
        total += recipe.calories
      }
    })
    return total
  }

  const getWeeklyTotalCalories = () => {
    let total = 0
    daysOfWeek.forEach((day) => {
      total += getTotalCalories(day)
    })
    return total
  }

  const weekDates = getWeekDates(selectedWeek)

  return (
    <div className="meal-planner">
      <div className="container">
        <div className="page-header">
          <h1>Meal Planner</h1>
          <p>
            Plan your weekly meals and stay on track with your healthy eating
            goals
          </p>
        </div>

        {/* Week Navigation */}
        <div className="week-navigation">
          <button
            onClick={() => {
              const prevWeek = new Date(selectedWeek)
              prevWeek.setDate(prevWeek.getDate() - 7)
              setSelectedWeek(prevWeek)
            }}
            className="week-nav-btn"
          >
            ← Previous Week
          </button>

          <div className="week-info">
            <FiCalendar />
            <span>
              Week of {formatDate(weekDates[0])} - {formatDate(weekDates[6])}
            </span>
          </div>

          <button
            onClick={() => {
              const nextWeek = new Date(selectedWeek)
              nextWeek.setDate(nextWeek.getDate() + 7)
              setSelectedWeek(nextWeek)
            }}
            className="week-nav-btn"
          >
            Next Week →
          </button>
        </div>

        {/* Weekly Stats */}
        <div className="weekly-stats">
          <div className="stat-card">
            <div className="stat-value">{getWeeklyTotalCalories()}</div>
            <div className="stat-label">Weekly Calories</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">
              {Math.round(getWeeklyTotalCalories() / 7)}
            </div>
            <div className="stat-label">Daily Average</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">{Object.keys(mealPlan).length}</div>
            <div className="stat-label">Planned Meals</div>
          </div>
        </div>

        {/* Meal Plan Grid */}
        <div className="meal-plan-grid">
          <div className="meal-grid-header">
            <div className="day-header">Day</div>
            {mealTypes.map((mealType) => (
              <div key={mealType} className="meal-header">
                {mealType.charAt(0).toUpperCase() + mealType.slice(1)}
              </div>
            ))}
            <div className="total-header">Daily Total</div>
          </div>

          {daysOfWeek.map((day, dayIndex) => (
            <div key={day} className="meal-row">
              <div className="day-cell">
                <div className="day-name">{day}</div>
                <div className="day-date">
                  {formatDate(weekDates[dayIndex])}
                </div>
              </div>

              {mealTypes.map((mealType) => {
                const key = `${day}-${mealType}`
                const recipe = mealPlan[key]

                return (
                  <div key={mealType} className="meal-cell">
                    {recipe ? (
                      <div className="meal-item">
                        <div className="meal-recipe">
                          {recipe.imageUrl ? (
                            <img
                              src={recipe.imageUrl}
                              alt={recipe.title}
                              className="recipe-img"
                              style={{
                                width: "40px",
                                height: "40px",
                                borderRadius: "50%",
                                marginRight: "0.5rem",
                                objectFit: "cover",
                                backgroundColor: "#f0f0f0",
                              }}
                              onError={(e) => {
                                e.target.style.display = "none"
                              }}
                              onLoad={() => {
                                // Image loaded successfully
                              }}
                            />
                          ) : (
                            <div
                              style={{
                                width: "40px",
                                height: "40px",
                                borderRadius: "50%",
                                marginRight: "0.5rem",
                                backgroundColor: "#e5e7eb",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                fontSize: "12px",
                                color: "#6b7280",
                              }}
                            >
                              IMG
                            </div>
                          )}
                          <div className="recipe-info">
                            <h4>{recipe.title}</h4>
                            <div className="recipe-meta">
                              <span>{recipe.calories} cal</span>
                              <span>
                                <FiClock /> {recipe.cookingTime}min
                              </span>
                            </div>
                          </div>
                        </div>
                        <button
                          onClick={() =>
                            removeRecipeFromMealPlan(day, mealType)
                          }
                          className="remove-recipe-btn"
                        >
                          <FiTrash2 />
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => openRecipeModal(day, mealType)}
                        className="add-meal-btn"
                      >
                        <FiPlus />
                        <span>Add {mealType}</span>
                      </button>
                    )}
                  </div>
                )
              })}

              <div className="total-cell">
                <div className="daily-total">{getTotalCalories(day)} cal</div>
              </div>
            </div>
          ))}
        </div>

        {/* Recipe Selection Modal */}
        {showRecipeModal && (
          <div
            className="modal-overlay"
            onClick={() => {
              setShowRecipeModal(false)
            }}
          >
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h3>
                  Choose a recipe for {selectedSlot.day} {selectedSlot.mealType}
                </h3>
                <button
                  onClick={() => {
                    setShowRecipeModal(false)
                  }}
                  className="modal-close"
                >
                  ×
                </button>
              </div>

              <div className="recipes-list">
                {availableRecipes.map((recipe) => (
                  <div
                    key={recipe.id}
                    onClick={(e) => {
                      e.preventDefault()
                      e.stopPropagation()
                      addRecipeToMealPlan(recipe)
                    }}
                    className="recipe-option"
                  >
                    <div
                      className="recipe-image"
                      style={{ flexShrink: 0, width: "80px", height: "80px" }}
                    >
                      {recipe.imageUrl ? (
                        <img
                          src={recipe.imageUrl}
                          alt={recipe.title}
                          className="recipe-img"
                          style={{
                            width: "80px",
                            height: "80px",
                            objectFit: "cover",
                            borderRadius: "8px",
                            backgroundColor: "#f0f0f0",
                          }}
                          onError={(e) => {
                            e.target.style.display = "none"
                          }}
                        />
                      ) : (
                        <div
                          style={{
                            width: "80px",
                            height: "80px",
                            backgroundColor: "#e5e7eb",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontSize: "14px",
                            color: "#6b7280",
                            borderRadius: "8px",
                          }}
                        >
                          No Image
                        </div>
                      )}
                    </div>
                    <div className="recipe-details">
                      <h4>{recipe.title}</h4>
                      <div className="recipe-meta">
                        <span>{recipe.calories} cal</span>
                        <span>
                          <FiClock /> {recipe.cookingTime}min
                        </span>
                        <span>
                          <FiUsers /> {recipe.servings} servings
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default MealPlanner
