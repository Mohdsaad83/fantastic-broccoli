import React from "react"
import { Link } from "react-router-dom"
import { FiTrendingUp, FiHeart, FiCalendar, FiUsers } from "react-icons/fi"
import "./Home.css"

const Home = () => {
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
                <Link to="/register" className="btn btn-outline btn-large">
                  Get Started Free
                </Link>
              </div>
            </div>
            <div className="hero-image">
              <div className="hero-card">
                <div className="recipe-preview">
                  <div className="recipe-image-placeholder">🥗</div>
                  <div className="recipe-info">
                    <h3>Mediterranean Bowl</h3>
                    <p>320 calories • 25min</p>
                    <div className="recipe-tags">
                      <span className="tag">Low Carb</span>
                      <span className="tag">High Protein</span>
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
              <div className="stat-number">500+</div>
              <div className="stat-label">Healthy Recipes</div>
            </div>
            <div className="stat-item">
              <div className="stat-number">10k+</div>
              <div className="stat-label">Happy Users</div>
            </div>
            <div className="stat-item">
              <div className="stat-number">95%</div>
              <div className="stat-label">Success Rate</div>
            </div>
            <div className="stat-item">
              <div className="stat-number">24/7</div>
              <div className="stat-label">Support</div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta">
        <div className="container">
          <div className="cta-content">
            <h2>Ready to Transform Your Health?</h2>
            <p>
              Join thousands of users who have already started their journey to
              a healthier lifestyle.
            </p>
            <Link to="/register" className="btn btn-primary btn-large">
              Start Your Journey Today
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}

export default Home
