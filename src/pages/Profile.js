import React, { useState, useEffect } from "react"
import { Link, useNavigate } from "react-router-dom"
import { useAuth } from "../contexts/Auth"
import { useRecipes } from "../hooks/useRecipes"
import recipesAPI from "../services/recipesAPI"
import {
  FiHeart,
  FiUser,
  FiSave,
  FiX,
  FiEdit,
  FiTrash2,
  FiPlus,
} from "react-icons/fi"

const Profile = () => {
  const { user, updateUser } = useAuth()
  const { getUserRecipes, deleteRecipe } = useRecipes()
  const navigate = useNavigate()

  const [activeTab, setActiveTab] = useState("recipes")
  const [userRecipes, setUserRecipes] = useState([])
  const [userStats, setUserStats] = useState({
    favoriteRecipes: [],
  })
  const [isDeleting, setIsDeleting] = useState(false)
  const [deleteId, setDeleteId] = useState(null)
  const [deleteError, setDeleteError] = useState("")
  const [profileData, setProfileData] = useState({
    firstName: user?.firstName || "",
    lastName: user?.lastName || "",
    email: user?.email || "",
    username: user?.username || "",
    bio: user?.bio || "",
    profileImage: user?.profileImage || null,
  })
  const [saveSuccess, setSaveSuccess] = useState(false)
  const [saveError, setSaveError] = useState("")
  const [imagePreview, setImagePreview] = useState(null)

  useEffect(() => {
    // Initialize profile data when user changes
    if (user) {
      setProfileData({
        firstName: user.firstName || "",
        lastName: user.lastName || "",
        email: user.email || "",
        username: user.username || "",
        bio: user.bio || "",
        profileImage: user.profileImage || null,
      })

      if (user.profileImage) {
        setImagePreview(user.profileImage)
      }
    }

    // Load favorites from backend
    const fetchFavorites = async () => {
      try {
        const result = await recipesAPI.getFavorites()
        if (result.success) {
          setUserStats((prev) => ({
            ...prev,
            favoriteRecipes: result.data || [],
          }))
        }
      } catch (error) {
        console.error("Error fetching favorites:", error)
        // Fallback to empty array
        setUserStats((prev) => ({
          ...prev,
          favoriteRecipes: [],
        }))
      }
    }

    if (user) {
      fetchFavorites()
    }
  }, [user])

  // Load user recipes
  useEffect(() => {
    if (activeTab === "recipes") {
      const fetchUserRecipes = async () => {
        try {
          const data = await getUserRecipes()
          setUserRecipes(data)
        } catch (error) {
          console.error("Failed to load user recipes", error)
        }
      }

      fetchUserRecipes()
    }
  }, [activeTab, getUserRecipes])

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setProfileData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleSaveProfile = async () => {
    try {
      setSaveError("")
      setSaveSuccess(false)

      const result = await updateUser(profileData)

      if (result.success) {
        setSaveSuccess(true)
        setTimeout(() => setSaveSuccess(false), 3000)
      }
    } catch (error) {
      setSaveError(error.message || "Failed to update profile")
    }
  }

  const handleCancelEdit = () => {
    // Reset form data to original user data
    if (user) {
      setProfileData({
        firstName: user.firstName || "",
        lastName: user.lastName || "",
        email: user.email || "",
        username: user.username || "",
        bio: user.bio || "",
        profileImage: user.profileImage || null,
      })
      setImagePreview(user.profileImage || null)
    }
    setSaveError("")
  }

  const handleImageUpload = (e) => {
    const file = e.target.files[0]
    if (file) {
      // Check file size (limit to 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert("Image size must be less than 5MB")
        return
      }

      // Check file type
      if (!file.type.startsWith("image/")) {
        alert("Please select a valid image file")
        return
      }

      const reader = new FileReader()
      reader.onload = (e) => {
        const imageData = e.target.result
        setImagePreview(imageData)
        setProfileData((prev) => ({
          ...prev,
          profileImage: imageData,
        }))
      }
      reader.readAsDataURL(file)
    }
  }

  const removeProfileImage = () => {
    setImagePreview(null)
    setProfileData((prev) => ({
      ...prev,
      profileImage: null,
    }))
  }

  const handleDeleteRecipe = async (id) => {
    setIsDeleting(true)
    setDeleteId(id)
    setDeleteError("")

    try {
      const result = await deleteRecipe(id)

      if (result.success) {
        // Remove from local state
        setUserRecipes((prev) => prev.filter((recipe) => recipe._id !== id))
      } else {
        setDeleteError(result.error || "Failed to delete recipe")
      }
    } catch (error) {
      setDeleteError("An error occurred while deleting the recipe")
    } finally {
      setIsDeleting(false)
      setDeleteId(null)
    }
  }

  const tabs = [
    { id: "recipes", label: "My Recipes", icon: <FiPlus /> },
    { id: "favorites", label: "Favorites", icon: <FiHeart /> },
    { id: "edit", label: "Edit Profile", icon: <FiUser /> },
  ]

  // If user is not logged in, show login prompt
  if (!user) {
    return (
      <div className="profile-page">
        <div className="container">
          <div
            className="not-logged-in"
            style={{
              textAlign: "center",
              padding: "60px 20px",
              background: "white",
              borderRadius: "12px",
              margin: "40px auto",
              maxWidth: "500px",
              boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
            }}
          >
            <div style={{ fontSize: "48px", marginBottom: "16px" }}>🔒</div>
            <h2
              style={{
                marginBottom: "12px",
                color: "var(--primary-text)",
              }}
            >
              Access Restricted
            </h2>
            <p
              style={{
                marginBottom: "24px",
                color: "#6b7280",
              }}
            >
              Please log in to view and edit your profile.
            </p>
            <button
              className="btn btn-primary"
              onClick={() => (window.location.href = "/login")}
              style={{
                padding: "12px 24px",
                fontSize: "16px",
              }}
            >
              Go to Login
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="profile-page">
      <div className="container">
        <div className="profile-header">
          <div className="profile-avatar">
            {imagePreview || profileData.profileImage ? (
              <img
                src={imagePreview || profileData.profileImage}
                alt="Profile"
                className="avatar-image"
                style={{
                  width: "80px",
                  height: "80px",
                  borderRadius: "50%",
                  objectFit: "cover",
                  border: "3px solid #4caf50",
                }}
              />
            ) : (
              <span className="avatar-icon">👤</span>
            )}
          </div>
          <div className="profile-info">
            <h1>{user?.name || "User"}</h1>
            <p>{user?.email || "No email"}</p>
          </div>
        </div>

        <div className="profile-tabs">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`tab-button ${activeTab === tab.id ? "active" : ""}`}
            >
              {tab.icon}
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        <div className="profile-content">
          {activeTab === "favorites" && (
            <div className="favorites-tab">
              <div className="tab-header">
                <h3>Your Favorite Recipes</h3>
                <p>Recipes you've saved for quick access</p>
              </div>

              {!user ? (
                <div
                  className="no-favorites"
                  style={{ textAlign: "center", padding: "40px 20px" }}
                >
                  <p style={{ fontSize: "18px", marginBottom: "20px" }}>
                    Please log in to view your favorite recipes.
                  </p>
                  <button
                    className="btn btn-primary"
                    onClick={() => (window.location.href = "/login")}
                    style={{
                      padding: "12px 24px",
                      fontSize: "16px",
                      borderRadius: "6px",
                      border: "none",
                      backgroundColor: "#4caf50",
                      color: "white",
                      cursor: "pointer",
                    }}
                  >
                    Go to Login
                  </button>
                </div>
              ) : (
                <div className="favorites-grid">
                  {userStats.favoriteRecipes.length > 0 ? (
                    userStats.favoriteRecipes.map((recipe) => (
                      <div
                        key={recipe._id || recipe.id}
                        className="favorite-card"
                      >
                        <div className="favorite-image">
                          {recipe.image ? (
                            <img
                              src={recipe.image}
                              alt={recipe.title}
                              className="recipe-image"
                              style={{
                                width: "100%",
                                height: "120px",
                                objectFit: "cover",
                                borderRadius: "8px",
                              }}
                            />
                          ) : (
                            <div
                              className="recipe-placeholder"
                              style={{
                                width: "100%",
                                height: "120px",
                                backgroundColor: "#e5e7eb",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                borderRadius: "8px",
                                color: "#6b7280",
                              }}
                            >
                              🥦
                            </div>
                          )}
                        </div>
                        <div className="favorite-content">
                          <h4>{recipe.title}</h4>
                          <p>
                            {recipe.nutrition?.calories || recipe.calories || 0}{" "}
                            calories
                          </p>
                          <p>
                            {recipe.cookTime || recipe.cookingTime || 0} min
                          </p>
                          <button
                            className="btn btn-outline btn-sm"
                            onClick={() =>
                              (window.location.href = `/recipe/${
                                recipe._id || recipe.id
                              }`)
                            }
                          >
                            View Recipe
                          </button>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div
                      className="no-favorites"
                      style={{
                        textAlign: "center",
                        padding: "60px 20px",
                        color: "#6b7280",
                        backgroundColor: "#f9fafb",
                        borderRadius: "12px",
                        border: "2px dashed #d1d5db",
                      }}
                    >
                      <div style={{ fontSize: "48px", marginBottom: "16px" }}>
                        ❤️
                      </div>
                      <p
                        style={{
                          fontSize: "18px",
                          marginBottom: "8px",
                          fontWeight: "500",
                        }}
                      >
                        No favorite recipes yet
                      </p>
                      <p style={{ fontSize: "14px", marginBottom: "24px" }}>
                        Start adding some from the recipes page!
                      </p>
                      <button
                        className="btn btn-primary"
                        onClick={() => (window.location.href = "/recipes")}
                        style={{
                          padding: "12px 24px",
                          fontSize: "16px",
                          borderRadius: "6px",
                          border: "none",
                          backgroundColor: "#4caf50",
                          color: "white",
                          cursor: "pointer",
                        }}
                      >
                        Browse Recipes
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {activeTab === "edit" && (
            <div className="edit-profile-tab">
              <div className="tab-header">
                <h3>Edit Profile</h3>
                <p>Update your personal information</p>
              </div>

              {saveSuccess && (
                <div
                  className="success-message"
                  style={{
                    backgroundColor: "#d4edda",
                    color: "#155724",
                    padding: "12px 16px",
                    borderRadius: "6px",
                    marginBottom: "20px",
                    border: "1px solid #c3e6cb",
                  }}
                >
                  ✅ Profile updated successfully!
                </div>
              )}

              {saveError && (
                <div
                  className="error-message"
                  style={{
                    backgroundColor: "#f8d7da",
                    color: "#721c24",
                    padding: "12px 16px",
                    borderRadius: "6px",
                    marginBottom: "20px",
                    border: "1px solid #f5c6cb",
                  }}
                >
                  ❌ {saveError}
                </div>
              )}

              <div className="profile-form">
                {/* Profile Image Section */}
                <div className="form-section">
                  <h4>Profile Picture</h4>
                  <div className="profile-image-upload">
                    <div className="current-image">
                      {imagePreview || profileData.profileImage ? (
                        <img
                          src={imagePreview || profileData.profileImage}
                          alt="Profile"
                          className="preview-image"
                          style={{
                            width: "120px",
                            height: "120px",
                            borderRadius: "50%",
                            objectFit: "cover",
                            border: "3px solid #4caf50",
                          }}
                        />
                      ) : (
                        <div
                          className="placeholder-image"
                          style={{
                            width: "120px",
                            height: "120px",
                            borderRadius: "50%",
                            backgroundColor: "#e5e7eb",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontSize: "48px",
                            color: "#6b7280",
                          }}
                        >
                          👤
                        </div>
                      )}
                    </div>
                    <div className="image-controls">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        style={{ display: "none" }}
                        id="profile-image-input"
                      />
                      <label
                        htmlFor="profile-image-input"
                        className="btn btn-outline"
                        style={{ marginRight: "10px", cursor: "pointer" }}
                      >
                        Change Photo
                      </label>
                      {(imagePreview || profileData.profileImage) && (
                        <button
                          onClick={removeProfileImage}
                          className="btn btn-outline-danger"
                        >
                          Remove
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                {/* Personal Information */}
                <div className="form-section">
                  <h4>Personal Information</h4>
                  <div className="form-grid">
                    <div className="form-group">
                      <label htmlFor="firstName">First Name</label>
                      <input
                        type="text"
                        id="firstName"
                        name="firstName"
                        value={profileData.firstName}
                        onChange={handleInputChange}
                        className="form-input"
                        placeholder="Enter your first name"
                      />
                    </div>
                    <div className="form-group">
                      <label htmlFor="lastName">Last Name</label>
                      <input
                        type="text"
                        id="lastName"
                        name="lastName"
                        value={profileData.lastName}
                        onChange={handleInputChange}
                        className="form-input"
                        placeholder="Enter your last name"
                      />
                    </div>
                    <div className="form-group">
                      <label htmlFor="username">Username</label>
                      <input
                        type="text"
                        id="username"
                        name="username"
                        value={profileData.username}
                        onChange={handleInputChange}
                        className="form-input"
                        placeholder="Enter your username"
                      />
                    </div>
                    <div className="form-group">
                      <label htmlFor="email">Email</label>
                      <input
                        type="email"
                        id="email"
                        name="email"
                        value={profileData.email}
                        onChange={handleInputChange}
                        className="form-input"
                        placeholder="Enter your email"
                      />
                    </div>
                  </div>
                  <div className="form-group">
                    <label htmlFor="bio">Bio</label>
                    <textarea
                      id="bio"
                      name="bio"
                      value={profileData.bio}
                      onChange={handleInputChange}
                      className="form-input"
                      placeholder="Tell us about yourself..."
                      rows="4"
                      style={{ resize: "vertical" }}
                    />
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="form-actions">
                  <button
                    onClick={handleSaveProfile}
                    className="btn btn-primary"
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                      marginRight: "12px",
                    }}
                  >
                    <FiSave /> Save Changes
                  </button>
                  <button
                    onClick={handleCancelEdit}
                    className="btn btn-outline"
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                    }}
                  >
                    <FiX /> Cancel
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeTab === "recipes" && (
            <div className="recipes-tab">
              <div className="tab-header">
                <h3>My Recipes</h3>
                <p>Recipes you've created</p>
              </div>

              <div className="tab-actions" style={{ marginBottom: "20px" }}>
                <Link to="/create-recipe" className="btn btn-primary">
                  <FiPlus /> Create New Recipe
                </Link>
              </div>

              {deleteError && (
                <div
                  className="alert alert-error"
                  style={{
                    marginBottom: "20px",
                    padding: "12px",
                    backgroundColor: "#ffebee",
                    color: "#c62828",
                    borderRadius: "4px",
                  }}
                >
                  {deleteError}
                </div>
              )}

              {userRecipes.length === 0 ? (
                <div
                  className="no-recipes"
                  style={{
                    textAlign: "center",
                    padding: "40px 20px",
                  }}
                >
                  <p style={{ fontSize: "18px", marginBottom: "20px" }}>
                    You haven't created any recipes yet.
                  </p>
                  <Link
                    to="/create-recipe"
                    className="btn btn-primary"
                    style={{
                      padding: "12px 24px",
                      fontSize: "16px",
                      borderRadius: "6px",
                      border: "none",
                      backgroundColor: "#4caf50",
                      color: "white",
                      cursor: "pointer",
                      display: "inline-block",
                      textDecoration: "none",
                    }}
                  >
                    Create Your First Recipe
                  </Link>
                </div>
              ) : (
                <div className="recipes-grid">
                  {userRecipes.map((recipe) => (
                    <div key={recipe._id} className="recipe-card">
                      <div className="recipe-image">
                        <img
                          src={`/recipe-images/${
                            recipe.image || recipe.title + ".jpg"
                          }`}
                          alt={recipe.title}
                          className="recipe-img"
                          onError={(e) => {
                            e.target.onerror = null
                            e.target.style.display = "none"
                            e.target.nextElementSibling.style.display = "flex"
                          }}
                        />
                        <div
                          className="recipe-emoji"
                          style={{ display: "none" }}
                        >
                          🥦
                        </div>
                      </div>
                      <div className="recipe-content">
                        <h3 className="recipe-title">{recipe.title}</h3>
                        <p className="recipe-description">
                          {recipe.description}
                        </p>

                        <div
                          className="recipe-actions"
                          style={{
                            marginTop: "15px",
                            display: "flex",
                            gap: "10px",
                          }}
                        >
                          <Link
                            to={`/edit-recipe/${recipe._id}`}
                            className="btn btn-outline-small"
                            style={{
                              padding: "8px 12px",
                              fontSize: "14px",
                              borderRadius: "4px",
                              border: "1px solid #4caf50",
                              backgroundColor: "transparent",
                              color: "#4caf50",
                              cursor: "pointer",
                              display: "flex",
                              alignItems: "center",
                              gap: "5px",
                              textDecoration: "none",
                            }}
                          >
                            <FiEdit size={14} /> Edit
                          </Link>
                          <button
                            onClick={() => handleDeleteRecipe(recipe._id)}
                            disabled={isDeleting && deleteId === recipe._id}
                            className="btn btn-danger-small"
                            style={{
                              padding: "8px 12px",
                              fontSize: "14px",
                              borderRadius: "4px",
                              border: "1px solid #f44336",
                              backgroundColor: "transparent",
                              color: "#f44336",
                              cursor: "pointer",
                              display: "flex",
                              alignItems: "center",
                              gap: "5px",
                            }}
                          >
                            <FiTrash2 size={14} />
                            {isDeleting && deleteId === recipe._id
                              ? "Deleting..."
                              : "Delete"}
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default Profile
