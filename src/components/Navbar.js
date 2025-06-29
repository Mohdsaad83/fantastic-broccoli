import React, { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { useAuth } from "../contexts/Auth"
import {
  FiMenu,
  FiX,
  FiUser,
  FiLogOut,
  FiHome,
  FiBook,
  FiCalendar,
} from "react-icons/fi"
import "./Navbar.css"

const Navbar = () => {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  // Get user profile image from localStorage
  const getUserProfileImage = () => {
    if (!user?.id) return null
    const savedProfile = localStorage.getItem(`profile_${user.id}`)
    if (savedProfile) {
      const parsedProfile = JSON.parse(savedProfile)
      return parsedProfile.profileImage
    }
    return null
  }

  const profileImage = getUserProfileImage()

  const handleLogout = () => {
    logout()
    navigate("/")
    setIsMenuOpen(false)
  }

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen)
  }

  const closeMenu = () => {
    setIsMenuOpen(false)
  }

  return (
    <nav className="navbar">
      <div className="container">
        <div className="navbar-content">
          <Link to="/" className="navbar-brand" onClick={closeMenu}>
            <span className="brand-icon">🥦</span>
            Fantastic Broccoli
          </Link>

          <div className={`navbar-links ${isMenuOpen ? "active" : ""}`}>
            <Link to="/" className="nav-link" onClick={closeMenu}>
              <FiHome /> Home
            </Link>
            <Link to="/recipes" className="nav-link" onClick={closeMenu}>
              <FiBook /> Recipes
            </Link>
            {user && (
              <Link to="/meal-planner" className="nav-link" onClick={closeMenu}>
                <FiCalendar /> Meal Planner
              </Link>
            )}
          </div>

          <div className={`navbar-auth ${isMenuOpen ? "active" : ""}`}>
            {user ? (
              <div className="user-menu">
                <Link
                  to="/profile"
                  className="nav-link profile-link"
                  onClick={closeMenu}
                >
                  {profileImage ? (
                    <img
                      src={profileImage}
                      alt="Profile"
                      style={{
                        width: "24px",
                        height: "24px",
                        borderRadius: "50%",
                        objectFit: "cover",
                        marginRight: "8px",
                      }}
                    />
                  ) : (
                    <FiUser style={{ marginRight: "8px" }} />
                  )}
                  {user.name}
                </Link>
                <button onClick={handleLogout} className="nav-link logout-btn">
                  <FiLogOut /> Logout
                </button>
              </div>
            ) : (
              <div className="auth-links">
                <Link to="/login" className="nav-link" onClick={closeMenu}>
                  Login
                </Link>
                <Link
                  to="/register"
                  className="btn btn-primary"
                  onClick={closeMenu}
                >
                  Sign Up
                </Link>
              </div>
            )}
          </div>

          <button className="menu-toggle" onClick={toggleMenu}>
            {isMenuOpen ? <FiX /> : <FiMenu />}
          </button>
        </div>
      </div>
    </nav>
  )
}

export default Navbar
