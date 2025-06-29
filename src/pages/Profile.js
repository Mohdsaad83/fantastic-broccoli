import React, { useState, useEffect } from "react"
import { useAuth } from "../contexts/Auth"
import {
  FiUser,
  FiHeart,
  FiTrendingDown,
  FiCalendar,
  FiTarget,
  FiEdit3,
} from "react-icons/fi"
import "./Profile.css"

// Sample data
const sampleFavorites = [
  {
    id: 1,
    title: "Mediterranean Quinoa Bowl",
    calories: 320,
    image: "🥗",
  },
  {
    id: 2,
    title: "Grilled Salmon with Avocado",
    calories: 380,
    image: "🐟",
  },
  {
    id: 3,
    title: "Green Smoothie Bowl",
    calories: 280,
    image: "🥤",
  },
]

const sampleWeightData = [
  { date: "2024-01-01", weight: 180 },
  { date: "2024-02-01", weight: 175 },
  { date: "2024-03-01", weight: 172 },
  { date: "2024-04-01", weight: 168 },
  { date: "2024-05-01", weight: 165 },
]

const Profile = () => {
  const { user } = useAuth()
  const [activeTab, setActiveTab] = useState("overview")
  const [userStats, setUserStats] = useState({
    favoriteRecipes: [],
    weightProgress: [],
    totalMealsLogged: 156,
    averageCalories: 1450,
    currentWeight: 165,
    targetWeight: 155,
    startingWeight: 180,
  })
  const [profileData, setProfileData] = useState({
    name: user?.name || "",
    email: user?.email || "",
    age: 28,
    height: "5'6\"",
    activityLevel: "moderate",
    profileImage: null, // Add profile image field
  })
  const [isEditing, setIsEditing] = useState(false)
  const [saveSuccess, setSaveSuccess] = useState(false)
  const [imagePreview, setImagePreview] = useState(null)

  useEffect(() => {
    // Load profile data from localStorage
    const savedProfile = localStorage.getItem(`profile_${user?.id}`)
    if (savedProfile) {
      const parsedProfile = JSON.parse(savedProfile)
      setProfileData((prev) => ({
        ...prev,
        ...parsedProfile,
        name: user?.name || parsedProfile.name,
        email: user?.email || parsedProfile.email,
      }))

      // Set image preview if profile image exists
      if (parsedProfile.profileImage) {
        setImagePreview(parsedProfile.profileImage)
      }
    }

    // Load favorites from localStorage
    const savedFavorites = JSON.parse(
      localStorage.getItem("userFavorites") || "[]"
    )
    const favoriteRecipes = sampleFavorites.filter((recipe) =>
      savedFavorites.includes(recipe.id)
    )

    setUserStats((prev) => ({
      ...prev,
      favoriteRecipes:
        favoriteRecipes.length > 0 ? favoriteRecipes : sampleFavorites,
      weightProgress: sampleWeightData,
    }))
  }, [user])

  const handleProfileUpdate = (e) => {
    e.preventDefault()
    setIsEditing(true)

    try {
      // Save to localStorage
      const profileToSave = {
        ...profileData,
        lastUpdated: new Date().toISOString(),
      }
      localStorage.setItem(`profile_${user?.id}`, JSON.stringify(profileToSave))

      // In a real app, you would make an API call to update the profile
      console.log("Profile updated successfully:", profileData)

      // Show success message
      setSaveSuccess(true)
      setTimeout(() => setSaveSuccess(false), 3000)
    } catch (error) {
      console.error("Error saving profile:", error)
    } finally {
      setIsEditing(false)
    }
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

  const calculateWeightLoss = () => {
    return userStats.startingWeight - userStats.currentWeight
  }

  const calculateProgress = () => {
    const totalToLose = userStats.startingWeight - userStats.targetWeight
    const lostSoFar = userStats.startingWeight - userStats.currentWeight
    return Math.round((lostSoFar / totalToLose) * 100)
  }

  const tabs = [
    { id: "overview", label: "Overview", icon: <FiUser /> },
    { id: "favorites", label: "Favorites", icon: <FiHeart /> },
    { id: "progress", label: "Progress", icon: <FiTrendingDown /> },
    { id: "settings", label: "Settings", icon: <FiEdit3 /> },
  ]

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
            <p>{user?.email}</p>
            <div className="profile-stats">
              <div className="stat-item">
                <span className="stat-value">{calculateWeightLoss()}lbs</span>
                <span className="stat-label">Lost</span>
              </div>
              <div className="stat-item">
                <span className="stat-value">{calculateProgress()}%</span>
                <span className="stat-label">Progress</span>
              </div>
              <div className="stat-item">
                <span className="stat-value">{userStats.totalMealsLogged}</span>
                <span className="stat-label">Meals Logged</span>
              </div>
            </div>
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
          {activeTab === "overview" && (
            <div className="overview-tab">
              <div className="overview-grid">
                <div className="overview-card">
                  <h3>Weight Journey</h3>
                  <div className="weight-summary">
                    <div className="weight-item">
                      <span className="weight-label">Starting</span>
                      <span className="weight-value">
                        {userStats.startingWeight} lbs
                      </span>
                    </div>
                    <div className="weight-item current">
                      <span className="weight-label">Current</span>
                      <span className="weight-value">
                        {userStats.currentWeight} lbs
                      </span>
                    </div>
                    <div className="weight-item">
                      <span className="weight-label">Target</span>
                      <span className="weight-value">
                        {userStats.targetWeight} lbs
                      </span>
                    </div>
                  </div>
                  <div className="progress-bar">
                    <div
                      className="progress-fill"
                      style={{ width: `${calculateProgress()}%` }}
                    ></div>
                  </div>
                  <p className="progress-text">
                    {calculateProgress()}% to your goal
                  </p>
                </div>

                <div className="overview-card">
                  <h3>This Week</h3>
                  <div className="week-stats">
                    <div className="week-stat">
                      <FiCalendar className="stat-icon" />
                      <div>
                        <span className="stat-number">6</span>
                        <span className="stat-desc">Days Active</span>
                      </div>
                    </div>
                    <div className="week-stat">
                      <FiTarget className="stat-icon" />
                      <div>
                        <span className="stat-number">
                          {userStats.averageCalories}
                        </span>
                        <span className="stat-desc">Avg Calories</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="overview-card">
                  <h3>Recent Favorites</h3>
                  <div className="recent-favorites">
                    {userStats.favoriteRecipes.slice(0, 3).map((recipe) => (
                      <div key={recipe.id} className="favorite-item">
                        <span className="recipe-emoji">{recipe.image}</span>
                        <div className="favorite-info">
                          <h4>{recipe.title}</h4>
                          <p>{recipe.calories} calories</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === "favorites" && (
            <div className="favorites-tab">
              <div className="tab-header">
                <h3>Your Favorite Recipes</h3>
                <p>Recipes you've saved for quick access</p>
              </div>
              <div className="favorites-grid">
                {userStats.favoriteRecipes.map((recipe) => (
                  <div key={recipe.id} className="favorite-card">
                    <div className="favorite-image">
                      <span className="recipe-emoji-large">{recipe.image}</span>
                    </div>
                    <div className="favorite-content">
                      <h4>{recipe.title}</h4>
                      <p>{recipe.calories} calories</p>
                      <button className="btn btn-outline btn-sm">
                        View Recipe
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === "progress" && (
            <div className="progress-tab">
              <div className="tab-header">
                <h3>Weight Progress</h3>
                <p>Track your weight loss journey over time</p>
              </div>

              <div className="progress-cards">
                <div className="progress-card">
                  <h4>Weight Loss</h4>
                  <div className="progress-value">
                    -{calculateWeightLoss()} lbs
                  </div>
                  <p className="progress-subtitle">Total lost</p>
                </div>

                <div className="progress-card">
                  <h4>Remaining</h4>
                  <div className="progress-value">
                    {userStats.currentWeight - userStats.targetWeight} lbs
                  </div>
                  <p className="progress-subtitle">To reach goal</p>
                </div>

                <div className="progress-card">
                  <h4>Progress</h4>
                  <div className="progress-value">{calculateProgress()}%</div>
                  <p className="progress-subtitle">Complete</p>
                </div>
              </div>

              <div className="weight-chart">
                <h4>Weight Over Time</h4>
                <div className="chart-placeholder">
                  <div className="chart-line">
                    {userStats.weightProgress.map((point, index) => (
                      <div
                        key={index}
                        className="chart-point"
                        style={{
                          left: `${
                            (index / (userStats.weightProgress.length - 1)) *
                            100
                          }%`,
                          bottom: `${
                            ((point.weight - userStats.targetWeight) /
                              (userStats.startingWeight -
                                userStats.targetWeight)) *
                              80 +
                            10
                          }%`,
                        }}
                        title={`${new Date(point.date).toLocaleDateString()}: ${
                          point.weight
                        } lbs`}
                      >
                        <div className="point"></div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === "settings" && (
            <div className="settings-tab">
              <div className="tab-header">
                <h3>Profile Settings</h3>
                <p>Update your personal information and preferences</p>
              </div>

              <form onSubmit={handleProfileUpdate} className="settings-form">
                {saveSuccess && (
                  <div
                    className="success-message"
                    style={{
                      background: "#d4edda",
                      border: "1px solid #c3e6cb",
                      color: "#155724",
                      padding: "12px",
                      borderRadius: "8px",
                      marginBottom: "20px",
                    }}
                  >
                    ✅ Profile updated successfully!
                  </div>
                )}

                <div className="form-section">
                  <h4>Personal Information</h4>

                  <div className="form-group">
                    <label>Profile Image</label>
                    <div className="profile-image-upload">
                      <div className="image-preview-container">
                        {imagePreview || profileData.profileImage ? (
                          <div className="image-preview">
                            <img
                              src={imagePreview || profileData.profileImage}
                              alt="Profile Preview"
                              style={{
                                width: "100px",
                                height: "100px",
                                borderRadius: "50%",
                                objectFit: "cover",
                                border: "2px solid #ddd",
                              }}
                            />
                            <button
                              type="button"
                              onClick={removeProfileImage}
                              className="remove-image-btn"
                              style={{
                                position: "absolute",
                                top: "5px",
                                right: "5px",
                                background: "#ff4444",
                                color: "white",
                                border: "none",
                                borderRadius: "50%",
                                width: "24px",
                                height: "24px",
                                cursor: "pointer",
                                fontSize: "12px",
                              }}
                            >
                              ✕
                            </button>
                          </div>
                        ) : (
                          <div
                            className="image-placeholder"
                            style={{
                              width: "100px",
                              height: "100px",
                              borderRadius: "50%",
                              background: "#f0f0f0",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              fontSize: "36px",
                              color: "#ccc",
                              border: "2px dashed #ddd",
                            }}
                          >
                            📷
                          </div>
                        )}
                      </div>
                      <div className="upload-controls">
                        <input
                          type="file"
                          id="profileImageInput"
                          accept="image/*"
                          onChange={handleImageUpload}
                          style={{ display: "none" }}
                        />
                        <label
                          htmlFor="profileImageInput"
                          className="btn btn-outline"
                          style={{
                            display: "inline-block",
                            padding: "8px 16px",
                            border: "1px solid #4caf50",
                            borderRadius: "4px",
                            color: "#4caf50",
                            cursor: "pointer",
                            textAlign: "center",
                            marginTop: "10px",
                          }}
                        >
                          Choose Image
                        </label>
                        <small
                          style={{
                            display: "block",
                            marginTop: "5px",
                            color: "#666",
                            fontSize: "12px",
                          }}
                        >
                          Max size: 5MB. Formats: JPG, PNG, GIF
                        </small>
                      </div>
                    </div>
                  </div>

                  <div className="form-group">
                    <label>Full Name</label>
                    <input
                      type="text"
                      value={profileData.name}
                      onChange={(e) =>
                        setProfileData({ ...profileData, name: e.target.value })
                      }
                      className="form-input"
                    />
                  </div>

                  <div className="form-group">
                    <label>Email</label>
                    <input
                      type="email"
                      value={profileData.email}
                      onChange={(e) =>
                        setProfileData({
                          ...profileData,
                          email: e.target.value,
                        })
                      }
                      className="form-input"
                    />
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label>Age</label>
                      <input
                        type="number"
                        value={profileData.age}
                        onChange={(e) =>
                          setProfileData({
                            ...profileData,
                            age: parseInt(e.target.value),
                          })
                        }
                        className="form-input"
                      />
                    </div>

                    <div className="form-group">
                      <label>Height</label>
                      <input
                        type="text"
                        value={profileData.height}
                        onChange={(e) =>
                          setProfileData({
                            ...profileData,
                            height: e.target.value,
                          })
                        }
                        className="form-input"
                        placeholder="e.g., 5'6&quot;"
                      />
                    </div>
                  </div>

                  <div className="form-group">
                    <label>Activity Level</label>
                    <select
                      value={profileData.activityLevel}
                      onChange={(e) =>
                        setProfileData({
                          ...profileData,
                          activityLevel: e.target.value,
                        })
                      }
                      className="form-input"
                    >
                      <option value="sedentary">
                        Sedentary (little/no exercise)
                      </option>
                      <option value="light">
                        Light (light exercise/sports 1-3 days/week)
                      </option>
                      <option value="moderate">
                        Moderate (moderate exercise/sports 3-5 days/week)
                      </option>
                      <option value="active">
                        Active (hard exercise/sports 6-7 days a week)
                      </option>
                      <option value="very-active">
                        Very Active (very hard exercise/physical job)
                      </option>
                    </select>
                  </div>
                </div>

                <div className="form-actions">
                  <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={isEditing}
                  >
                    {isEditing ? "Saving..." : "Save Changes"}
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default Profile
