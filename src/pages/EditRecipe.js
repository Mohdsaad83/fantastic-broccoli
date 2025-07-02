import React, { useState, useEffect } from "react"
import { useNavigate, useParams } from "react-router-dom"
import { FiSave, FiPlus, FiMinus, FiArrowLeft } from "react-icons/fi"
import { useRecipes } from "../hooks/useRecipes"

const EditRecipe = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const { getRecipe, updateRecipe, getCategories } = useRecipes()

  // Form state
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "",
    servings: 4,
    prepTime: 15,
    cookTime: 30,
    difficulty: "medium",
    ingredients: [{ name: "", amount: "1", unit: "piece" }],
    instructions: [{ text: "" }],
    tags: [],
    nutrition: {
      calories: 0,
      protein: 0,
      carbs: 0,
      fat: 0,
      fiber: 0,
    },
    isPublished: true,
  })

  // Status states
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [categories, setCategories] = useState([])
  const [newTag, setNewTag] = useState("")
  const [initialLoading, setInitialLoading] = useState(true)

  // Load recipe data and categories
  useEffect(() => {
    const loadData = async () => {
      try {
        setInitialLoading(true)

        // Load recipe
        const recipeData = await getRecipe(id)

        if (recipeData) {
          // Transform recipe data to form format
          setFormData({
            title: recipeData.title || "",
            description: recipeData.description || "",
            category: recipeData.category?._id || recipeData.category || "",
            servings: recipeData.servings || 4,
            prepTime: recipeData.prepTime || 15,
            cookTime: recipeData.cookTime || 30,
            difficulty: recipeData.difficulty || "medium",
            ingredients:
              recipeData.ingredients?.length > 0
                ? recipeData.ingredients
                : [{ name: "", amount: "", unit: "" }],
            instructions:
              recipeData.instructions?.length > 0
                ? recipeData.instructions
                : [{ text: "" }],
            tags: recipeData.tags || recipeData.dietaryTags || [],
            nutrition: recipeData.nutrition || {
              calories: 0,
              protein: 0,
              carbs: 0,
              fat: 0,
              fiber: 0,
            },
            isPublished: recipeData.isPublished !== false,
          })
        } else {
          setError("Recipe not found")
        }

        // Load categories from API
        const categoriesData = await getCategories()
        if (Array.isArray(categoriesData) && categoriesData.length > 0) {
          setCategories(categoriesData)
        } else {
          console.error("No categories returned from API")
          // Fallback to default categories if API fails
          setCategories([
            { _id: "64b5a4e1f3d7c9a8e0b2c3d4", name: "Breakfast" },
            { _id: "64b5a4e1f3d7c9a8e0b2c3d5", name: "Lunch" },
            { _id: "64b5a4e1f3d7c9a8e0b2c3d6", name: "Dinner" },
          ])
        }
      } catch (err) {
        console.error("Failed to load recipe data", err)
        setError("Failed to load recipe. Please try again.")
      } finally {
        setInitialLoading(false)
      }
    }

    loadData()
  }, [id, getRecipe])

  // Handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  // Handle nested nutrition changes
  const handleNutritionChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      nutrition: {
        ...prev.nutrition,
        [name]: parseFloat(value) || 0,
      },
    }))
  }

  // Handle ingredients changes
  const handleIngredientChange = (index, field, value) => {
    const updatedIngredients = [...formData.ingredients]
    updatedIngredients[index] = {
      ...updatedIngredients[index],
      [field]: value,
    }

    setFormData((prev) => ({
      ...prev,
      ingredients: updatedIngredients,
    }))
  }

  // Add new ingredient
  const addIngredient = () => {
    setFormData((prev) => ({
      ...prev,
      ingredients: [
        ...prev.ingredients,
        { name: "", amount: "1", unit: "piece" },
      ],
    }))
  }

  // Remove ingredient
  const removeIngredient = (index) => {
    if (formData.ingredients.length > 1) {
      setFormData((prev) => ({
        ...prev,
        ingredients: prev.ingredients.filter((_, i) => i !== index),
      }))
    }
  }

  // Handle instructions changes
  const handleInstructionChange = (index, value) => {
    const updatedInstructions = [...formData.instructions]
    updatedInstructions[index] = { text: value }

    setFormData((prev) => ({
      ...prev,
      instructions: updatedInstructions,
    }))
  }

  // Add new instruction
  const addInstruction = () => {
    setFormData((prev) => ({
      ...prev,
      instructions: [...prev.instructions, { text: "" }],
    }))
  }

  // Remove instruction
  const removeInstruction = (index) => {
    if (formData.instructions.length > 1) {
      setFormData((prev) => ({
        ...prev,
        instructions: prev.instructions.filter((_, i) => i !== index),
      }))
    }
  }

  // Handle adding a tag
  const addTag = () => {
    if (newTag.trim() && !formData.tags.includes(newTag.trim())) {
      setFormData((prev) => ({
        ...prev,
        tags: [...prev.tags, newTag.trim()],
      }))
      setNewTag("")
    }
  }

  // Handle removing a tag
  const removeTag = (tag) => {
    setFormData((prev) => ({
      ...prev,
      tags: prev.tags.filter((t) => t !== tag),
    }))
  }

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    try {
      // Validate required fields
      if (!formData.title || !formData.description || !formData.category) {
        setError("Please fill in all required fields")
        setLoading(false)
        return
      }

      // Filter out empty ingredients and instructions and transform data
      const cleanedData = {
        ...formData,
        ingredients: formData.ingredients
          .filter((ing) => ing.name.trim())
          .map((ing) => ({
            name: ing.name.trim(),
            amount: parseFloat(ing.amount) || 1,
            unit: ing.unit || "piece",
          })),
        instructions: formData.instructions
          .filter((ins) => ins.text.trim())
          .map((ins, index) => ({
            stepNumber: index + 1,
            instruction: ins.text.trim(),
          })),
      }

      if (cleanedData.ingredients.length === 0) {
        setError("Please add at least one ingredient")
        setLoading(false)
        return
      }

      if (cleanedData.instructions.length === 0) {
        setError("Please add at least one instruction")
        setLoading(false)
        return
      }

      const result = await updateRecipe(id, cleanedData)

      if (result.success) {
        navigate(`/recipes/${id}`)
      } else {
        setError(result.error || "Failed to update recipe")
      }
    } catch (err) {
      setError("An error occurred. Please try again.")
      console.error("Error updating recipe:", err)
    } finally {
      setLoading(false)
    }
  }

  if (initialLoading) {
    return (
      <div className="edit-recipe-page">
        <div className="container">
          <div className="loading">Loading recipe data...</div>
        </div>
      </div>
    )
  }

  return (
    <div className="edit-recipe-page glassmorphism-bg">
      <div className="container">
        <div
          className="page-header glassmorphism"
          style={{
            display: "flex",
            alignItems: "center",
            gap: "1.2rem",
            justifyContent: "space-between",
            flexWrap: "wrap",
            padding: "2rem",
            marginBottom: "2rem",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
            <button
              onClick={() => navigate(-1)}
              className="btn btn-outline"
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.5rem",
                padding: "0.5rem 1rem",
              }}
            >
              <FiArrowLeft /> Back
            </button>
            <div
              style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}
            >
              <span
                style={{
                  fontSize: "2rem",
                  lineHeight: 1,
                  fontFamily: "Nunito, Inter, sans-serif",
                }}
              >
                ✏️
              </span>
              <h1
                style={{
                  fontFamily: "Nunito, Inter, sans-serif",
                  fontWeight: 900,
                  fontSize: "2rem",
                  letterSpacing: "0.01em",
                  margin: 0,
                  color: "#059669",
                  textShadow: "0 2px 8px #10b98122, 0 1px 0 #fff",
                }}
              >
                Edit Recipe
              </h1>
            </div>
          </div>
        </div>

        {error && (
          <div
            className="error-banner"
            style={{
              background: "#fee2e2",
              border: "1px solid #fecaca",
              borderRadius: "1rem",
              padding: "1rem",
              marginBottom: "1.5rem",
              color: "#dc2626",
            }}
          >
            <p>⚠️ {error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="recipe-form">
          <div
            className="form-section glassmorphism"
            style={{
              padding: "2rem",
              marginBottom: "1.5rem",
            }}
          >
            <h3
              style={{
                color: "#059669",
                marginBottom: "1.5rem",
                fontFamily: "Nunito, Inter, sans-serif",
                fontWeight: 700,
                fontSize: "1.25rem",
              }}
            >
              Basic Information
            </h3>

            <div className="form-group">
              <label htmlFor="title" className="form-label">
                Recipe Title *
              </label>
              <input
                type="text"
                id="title"
                name="title"
                value={formData.title}
                onChange={handleChange}
                placeholder="Enter recipe title (min. 3 characters)"
                className="form-input"
                required
                minLength={3}
              />
            </div>

            <div className="form-group">
              <label htmlFor="description" className="form-label">
                Description *
              </label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Brief description of your recipe (min. 10 characters)"
                className="form-input"
                required
                minLength={10}
              ></textarea>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="category" className="form-label">
                  Category *
                </label>
                <select
                  id="category"
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  className="form-input"
                  required
                >
                  <option value="">Select Category</option>
                  {categories.map((category) => (
                    <option key={category._id} value={category._id}>
                      {category.icon} {category.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="difficulty" className="form-label">
                  Difficulty
                </label>
                <select
                  id="difficulty"
                  name="difficulty"
                  value={formData.difficulty}
                  onChange={handleChange}
                  className="form-input"
                >
                  <option value="easy">🟢 Easy</option>
                  <option value="medium">🟡 Medium</option>
                  <option value="hard">🔴 Hard</option>
                </select>
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="servings" className="form-label">
                  👥 Servings
                </label>
                <input
                  type="number"
                  id="servings"
                  name="servings"
                  value={formData.servings}
                  onChange={handleChange}
                  min="1"
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label htmlFor="prepTime">Prep Time (mins)</label>
                <input
                  type="number"
                  id="prepTime"
                  name="prepTime"
                  value={formData.prepTime}
                  onChange={handleChange}
                  min="0"
                />
              </div>

              <div className="form-group">
                <label htmlFor="cookTime">Cook Time (mins)</label>
                <input
                  type="number"
                  id="cookTime"
                  name="cookTime"
                  value={formData.cookTime}
                  onChange={handleChange}
                  min="0"
                />
              </div>
            </div>
          </div>

          <div
            className="form-section glassmorphism"
            style={{
              padding: "2rem",
              marginBottom: "1.5rem",
            }}
          >
            <h3
              style={{
                color: "#059669",
                marginBottom: "1.5rem",
                fontFamily: "Nunito, Inter, sans-serif",
                fontWeight: 700,
                fontSize: "1.25rem",
              }}
            >
              🥘 Ingredients
            </h3>
            {formData.ingredients.map((ingredient, index) => (
              <div key={index} className="ingredient-row">
                <div className="form-row">
                  <div className="form-group">
                    <input
                      type="text"
                      placeholder="Ingredient name"
                      value={ingredient.name}
                      onChange={(e) =>
                        handleIngredientChange(index, "name", e.target.value)
                      }
                    />
                  </div>

                  <div className="form-group">
                    <input
                      type="number"
                      step="0.1"
                      min="0.1"
                      placeholder="Amount"
                      value={ingredient.amount}
                      onChange={(e) =>
                        handleIngredientChange(index, "amount", e.target.value)
                      }
                    />
                  </div>

                  <div className="form-group">
                    <select
                      value={ingredient.unit}
                      onChange={(e) =>
                        handleIngredientChange(index, "unit", e.target.value)
                      }
                    >
                      <option value="">Select Unit</option>
                      <option value="cup">Cup</option>
                      <option value="tbsp">Tablespoon</option>
                      <option value="tsp">Teaspoon</option>
                      <option value="oz">Ounce</option>
                      <option value="lb">Pound</option>
                      <option value="g">Gram</option>
                      <option value="kg">Kilogram</option>
                      <option value="ml">Milliliter</option>
                      <option value="l">Liter</option>
                      <option value="piece">Piece</option>
                      <option value="clove">Clove</option>
                      <option value="slice">Slice</option>
                      <option value="pinch">Pinch</option>
                      <option value="dash">Dash</option>
                    </select>
                  </div>

                  <button
                    type="button"
                    onClick={() => removeIngredient(index)}
                    className="btn btn-icon"
                    disabled={formData.ingredients.length === 1}
                  >
                    <FiMinus />
                  </button>
                </div>
              </div>
            ))}

            <button
              type="button"
              onClick={addIngredient}
              className="btn btn-outline btn-small"
            >
              <FiPlus /> Add Ingredient
            </button>
          </div>

          <div
            className="form-section glassmorphism"
            style={{
              padding: "2rem",
              marginBottom: "1.5rem",
            }}
          >
            <h3
              style={{
                color: "#059669",
                marginBottom: "1.5rem",
                fontFamily: "Nunito, Inter, sans-serif",
                fontWeight: 700,
                fontSize: "1.25rem",
              }}
            >
              📝 Instructions
            </h3>
            {formData.instructions.map((instruction, index) => (
              <div key={index} className="instruction-row">
                <div className="form-row">
                  <div className="instruction-number">{index + 1}</div>
                  <div className="form-group instruction-input">
                    <textarea
                      placeholder="Instruction step"
                      value={instruction.text}
                      onChange={(e) =>
                        handleInstructionChange(index, e.target.value)
                      }
                    ></textarea>
                  </div>

                  <button
                    type="button"
                    onClick={() => removeInstruction(index)}
                    className="btn btn-icon"
                    disabled={formData.instructions.length === 1}
                  >
                    <FiMinus />
                  </button>
                </div>
              </div>
            ))}

            <button
              type="button"
              onClick={addInstruction}
              className="btn btn-outline btn-small"
            >
              <FiPlus /> Add Step
            </button>
          </div>

          <div
            className="form-section glassmorphism"
            style={{
              padding: "2rem",
              marginBottom: "1.5rem",
            }}
          >
            <h3
              style={{
                color: "#059669",
                marginBottom: "1.5rem",
                fontFamily: "Nunito, Inter, sans-serif",
                fontWeight: 700,
                fontSize: "1.25rem",
              }}
            >
              🏷️ Tags
            </h3>
            <div className="tags-input-container">
              <div className="form-row">
                <div className="form-group tags-input">
                  <input
                    type="text"
                    placeholder="Add a tag (e.g., Vegan, Gluten-Free)"
                    value={newTag}
                    onChange={(e) => setNewTag(e.target.value)}
                  />
                </div>
                <button
                  type="button"
                  onClick={addTag}
                  className="btn btn-outline btn-small"
                >
                  <FiPlus /> Add
                </button>
              </div>

              <div className="tags-container">
                {formData.tags.map((tag, index) => (
                  <div key={index} className="tag">
                    <span>{tag}</span>
                    <button
                      type="button"
                      onClick={() => removeTag(tag)}
                      className="tag-remove"
                    >
                      <FiMinus />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div
            className="form-section glassmorphism"
            style={{
              padding: "2rem",
              marginBottom: "1.5rem",
            }}
          >
            <h3
              style={{
                color: "#059669",
                marginBottom: "1.5rem",
                fontFamily: "Nunito, Inter, sans-serif",
                fontWeight: 700,
                fontSize: "1.25rem",
              }}
            >
              📊 Nutrition Information
            </h3>
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="calories">Calories</label>
                <input
                  type="number"
                  id="calories"
                  name="calories"
                  value={formData.nutrition.calories}
                  onChange={handleNutritionChange}
                  min="0"
                />
              </div>

              <div className="form-group">
                <label htmlFor="protein">Protein (g)</label>
                <input
                  type="number"
                  id="protein"
                  name="protein"
                  value={formData.nutrition.protein}
                  onChange={handleNutritionChange}
                  min="0"
                />
              </div>

              <div className="form-group">
                <label htmlFor="carbs">Carbs (g)</label>
                <input
                  type="number"
                  id="carbs"
                  name="carbs"
                  value={formData.nutrition.carbs}
                  onChange={handleNutritionChange}
                  min="0"
                />
              </div>

              <div className="form-group">
                <label htmlFor="fat">Fat (g)</label>
                <input
                  type="number"
                  id="fat"
                  name="fat"
                  value={formData.nutrition.fat}
                  onChange={handleNutritionChange}
                  min="0"
                />
              </div>
            </div>
          </div>

          <div
            className="form-actions"
            style={{
              display: "flex",
              gap: "1rem",
              justifyContent: "flex-end",
              marginTop: "2rem",
              padding: "0 2rem",
            }}
          >
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="btn btn-outline"
              disabled={loading}
            >
              Cancel
            </button>

            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.5rem",
              }}
            >
              <FiSave />
              {loading ? "Updating..." : "Update Recipe"}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default EditRecipe
