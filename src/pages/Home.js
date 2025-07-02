import React, { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import { FiTrendingUp, FiHeart, FiCalendar, FiUsers } from "react-icons/fi"
import recipesAPI from "../services/recipesAPI"

const Home = () => {
  const [stats, setStats] = useState({
    recipesCount: 0,
    usersCount: 0,
    successRate: 95,
    support: "24/7",
  })

  useEffect(() => {
    // Fetch real stats from backend
    const fetchStats = async () => {
      try {
        const recipesResponse = await recipesAPI.getRecipes()
        if (recipesResponse.success) {
          setStats((prev) => ({
            ...prev,
            recipesCount: recipesResponse.data.length,
          }))
        }
      } catch (error) {
        console.error("Error fetching stats:", error)
      }
    }

    fetchStats()
  }, [])

  const features = [
    {
      icon: <FiTrendingUp />,
      title: "Track Progress",
      description:
        "Monitor your weight loss journey with detailed analytics and insights.",
    },
    {
      icon: <FiHeart />,
      title: "Healthy Recipes",
      description:
        "Discover delicious, nutritious recipes designed for weight loss.",
    },
    {
      icon: <FiCalendar />,
      title: "Meal Planning",
      description:
        "Plan your weekly meals and stay consistent with your goals.",
    },
    {
      icon: <FiUsers />,
      title: "Community",
      description:
        "Join a supportive community of health-conscious individuals.",
    },
  ]

  return (
    <div className="home">
      {/* Hero Section */}
      <section className="hero">
        <div className="container">
          <div className="hero-content">
            <div className="hero-text">
              <h1 className="hero-title">
                Your Journey to a
                <span className="text-gradient"> Healthier You</span>
                <br />
                Starts Here
              </h1>
              <p className="hero-description">
                Discover delicious, healthy recipes crafted for weight loss.
                Plan your meals, track your progress, and achieve your wellness
                goals with our comprehensive cookbook platform.
              </p>
              <div className="hero-actions">
                <Link to="/recipes" className="btn btn-primary btn-large">
                  Explore Recipes
                </Link>
              </div>
            </div>
            <div className="hero-image">
              <div className="hero-card">
                <div className="recipe-preview">
                  <div className="recipe-image-placeholder">🥗</div>
                  <div className="recipe-info">
                    <h3>Healthy Recipes</h3>
                    <p>Nutritious • Delicious</p>
                    <div className="recipe-tags">
                      <span className="tag">Fresh</span>
                      <span className="tag">Healthy</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="features">
        <div className="container">
          <div className="section-header">
            <h2>Everything You Need for Success</h2>
            <p>
              Comprehensive tools and resources to support your healthy
              lifestyle
            </p>
          </div>
          <div className="features-grid">
            {features.map((feature, index) => (
              <div key={index} className="feature-card">
                <div className="feature-icon">{feature.icon}</div>
                <h3>{feature.title}</h3>
                <p>{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="stats">
        <div className="container">
          <div className="stats-grid">
            <div className="stat-item">
              <div className="stat-number">{stats.recipesCount}+</div>
              <div className="stat-label">Healthy Recipes</div>
            </div>
            <div className="stat-item">
              <div className="stat-number">10k+</div>
              <div className="stat-label">Happy Users</div>
            </div>
            <div className="stat-item">
              <div className="stat-number">{stats.successRate}%</div>
              <div className="stat-label">Success Rate</div>
            </div>
            <div className="stat-item">
              <div className="stat-number">{stats.support}</div>
              <div className="stat-label">Support</div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

export default Home
