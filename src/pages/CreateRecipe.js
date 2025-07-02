import React, { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { FiSave, FiPlus, FiMinus, FiArrowLeft } from "react-icons/fi"
import { useRecipes } from "../hooks/useRecipes"

const CreateRecipe = () => {
  const navigate = useNavigate()
  const { createRecipe, getCategories } = useRecipes()

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

  // Load categories from API
  useEffect(() => {
    const loadCategories = async () => {
      try {
        console.log("Loading categories...")
        const categoriesData = await getCategories()
        console.log("Categories data received:", categoriesData)

        if (Array.isArray(categoriesData) && categoriesData.length > 0) {
          setCategories(categoriesData)
          console.log("Categories loaded successfully:", categoriesData)
        } else {
          console.error("No categories returned from API")
          // Fallback to real categories if API fails
          setCategories([
            { _id: "68655f961fe32e0e482c1eb1", name: "Breakfast", icon: "🍳" },
            { _id: "68655f961fe32e0e482c1eb2", name: "Lunch", icon: "🥗" },
            { _id: "68655f961fe32e0e482c1eb3", name: "Dinner", icon: "🍽️" },
          ])
        }
      } catch (err) {
        console.error("Failed to load categories", err)
        // Use real categories as fallback
        setCategories([
          { _id: "68655f961fe32e0e482c1eb1", name: "Breakfast", icon: "🍳" },
          { _id: "68655f961fe32e0e482c1eb2", name: "Lunch", icon: "🥗" },
          { _id: "68655f961fe32e0e482c1eb3", name: "Dinner", icon: "🍽️" },
        ])
      }
    }

    loadCategories()
  }, [getCategories])

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

      console.log("Form data before cleaning:", formData)
      console.log("Cleaned data to send:", cleanedData)

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

      const result = await createRecipe(cleanedData)

      if (result.success) {
        navigate(`/recipes/${result.data._id}`)
      } else {
        console.error("Recipe creation failed:", result)
        if (result.details) {
          console.error("Validation details:", result.details)
          // Create a more detailed error message
          const detailMessages = result.details
            .map((detail) => `${detail.field}: ${detail.message}`)
            .join(", ")
          setError(`${result.error}. Details: ${detailMessages}`)
        } else {
          setError(result.error || "Failed to create recipe")
        }
      }
    } catch (err) {
      setError("An error occurred. Please try again.")
      console.error("Error creating recipe:", err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="create-recipe-page glassmorphism-bg">
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
                ✨
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
                Create New Recipe
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
                <label htmlFor="prepTime" className="form-label">
                  ⏱️ Prep Time (mins)
                </label>
                <input
                  type="number"
                  id="prepTime"
                  name="prepTime"
                  value={formData.prepTime}
                  onChange={handleChange}
                  min="0"
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label htmlFor="cookTime" className="form-label">
                  🔥 Cook Time (mins)
                </label>
                <input
                  type="number"
                  id="cookTime"
                  name="cookTime"
                  value={formData.cookTime}
                  onChange={handleChange}
                  min="0"
                  className="form-input"
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
                display: "flex",
                alignItems: "center",
                gap: "0.5rem",
              }}
            >
              🥕 Ingredients
            </h3>
            {formData.ingredients.map((ingredient, index) => (
              <div
                key={index}
                className="ingredient-row"
                style={{
                  background: "rgba(255, 255, 255, 0.5)",
                  borderRadius: "0.75rem",
                  padding: "1rem",
                  marginBottom: "1rem",
                  border: "1px solid rgba(16, 185, 129, 0.1)",
                }}
              >
                <div className="form-row">
                  <div className="form-group">
                    <input
                      type="text"
                      placeholder="Ingredient name"
                      value={ingredient.name}
                      onChange={(e) =>
                        handleIngredientChange(index, "name", e.target.value)
                      }
                      className="form-input"
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
                      className="form-input"
                    />
                  </div>

                  <div className="form-group">
                    <select
                      value={ingredient.unit}
                      onChange={(e) =>
                        handleIngredientChange(index, "unit", e.target.value)
                      }
                      className="form-input"
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
                    className="btn btn-danger"
                    disabled={formData.ingredients.length === 1}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      padding: "0.5rem",
                      width: "auto",
                      minWidth: "40px",
                    }}
                  >
                    <FiMinus />
                  </button>
                </div>
              </div>
            ))}

            <button
              type="button"
              onClick={addIngredient}
              className="btn btn-outline"
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.5rem",
                margin: "1rem 0",
              }}
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
                display: "flex",
                alignItems: "center",
                gap: "0.5rem",
              }}
            >
              📝 Instructions
            </h3>
            {formData.instructions.map((instruction, index) => (
              <div
                key={index}
                className="instruction-row"
                style={{
                  background: "rgba(255, 255, 255, 0.5)",
                  borderRadius: "0.75rem",
                  padding: "1rem",
                  marginBottom: "1rem",
                  border: "1px solid rgba(16, 185, 129, 0.1)",
                  display: "flex",
                  alignItems: "flex-start",
                  gap: "1rem",
                }}
              >
                <div
                  style={{
                    background: "#059669",
                    color: "white",
                    borderRadius: "50%",
                    width: "2rem",
                    height: "2rem",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontWeight: "600",
                    flexShrink: 0,
                  }}
                >
                  {index + 1}
                </div>
                <div className="form-group" style={{ flex: 1 }}>
                  <textarea
                    placeholder="Instruction step (min. 10 characters)"
                    value={instruction.text}
                    onChange={(e) =>
                      handleInstructionChange(index, e.target.value)
                    }
                    className="form-input"
                    minLength={10}
                    style={{ minHeight: "80px" }}
                  ></textarea>
                </div>

                <button
                  type="button"
                  onClick={() => removeInstruction(index)}
                  className="btn btn-danger"
                  disabled={formData.instructions.length === 1}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    padding: "0.5rem",
                    width: "auto",
                    minWidth: "40px",
                  }}
                >
                  <FiMinus />
                </button>
              </div>
            ))}

            <button
              type="button"
              onClick={addInstruction}
              className="btn btn-outline"
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.5rem",
                margin: "1rem 0",
              }}
            >
              <FiPlus /> Add Instruction
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
                display: "flex",
                alignItems: "center",
                gap: "0.5rem",
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
                    className="form-input"
                  />
                </div>
                <button
                  type="button"
                  onClick={addTag}
                  className="btn btn-outline"
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "0.5rem",
                  }}
                >
                  <FiPlus /> Add
                </button>
              </div>

              <div
                className="tags-container"
                style={{
                  display: "flex",
                  flexWrap: "wrap",
                  gap: "0.5rem",
                  marginTop: "1rem",
                }}
              >
                {formData.tags.map((tag, index) => (
                  <div
                    key={index}
                    style={{
                      background: "rgba(16, 185, 129, 0.1)",
                      border: "1px solid rgba(16, 185, 129, 0.3)",
                      borderRadius: "1rem",
                      padding: "0.25rem 0.75rem",
                      display: "flex",
                      alignItems: "center",
                      gap: "0.5rem",
                      fontSize: "0.875rem",
                    }}
                  >
                    <span>{tag}</span>
                    <button
                      type="button"
                      onClick={() => removeTag(tag)}
                      style={{
                        background: "none",
                        border: "none",
                        color: "#dc2626",
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        padding: "0.125rem",
                      }}
                    >
                      <FiMinus size={12} />
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
                display: "flex",
                alignItems: "center",
                gap: "0.5rem",
              }}
            >
              🥗 Nutrition Information
            </h3>
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="calories" className="form-label">
                  🔥 Calories
                </label>
                <input
                  type="number"
                  id="calories"
                  name="calories"
                  value={formData.nutrition.calories}
                  onChange={handleNutritionChange}
                  min="0"
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label htmlFor="protein" className="form-label">
                  💪 Protein (g)
                </label>
                <input
                  type="number"
                  id="protein"
                  name="protein"
                  value={formData.nutrition.protein}
                  onChange={handleNutritionChange}
                  min="0"
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label htmlFor="carbs" className="form-label">
                  🍞 Carbs (g)
                </label>
                <input
                  type="number"
                  id="carbs"
                  name="carbs"
                  value={formData.nutrition.carbs}
                  onChange={handleNutritionChange}
                  min="0"
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label htmlFor="fat" className="form-label">
                  🥑 Fat (g)
                </label>
                <input
                  type="number"
                  id="fat"
                  name="fat"
                  value={formData.nutrition.fat}
                  onChange={handleNutritionChange}
                  min="0"
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label htmlFor="fiber" className="form-label">
                  🌾 Fiber (g)
                </label>
                <input
                  type="number"
                  id="fiber"
                  name="fiber"
                  value={formData.nutrition.fiber}
                  onChange={handleNutritionChange}
                  min="0"
                  className="form-input"
                />
              </div>
            </div>
          </div>

          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              gap: "1rem",
              padding: "2rem",
              background: "rgba(255, 255, 255, 0.75)",
              borderRadius: "1.25rem",
              boxShadow: "0 8px 32px #10b98122, 0 2px 8px #05966911",
              backdropFilter: "blur(12px) saturate(160%)",
            }}
          >
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="btn btn-outline"
              disabled={loading}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.5rem",
              }}
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
                fontSize: "1.1rem",
                padding: "0.875rem 2rem",
              }}
            >
              <FiSave />
              {loading ? "Creating..." : "Create Recipe"}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default CreateRecipe
