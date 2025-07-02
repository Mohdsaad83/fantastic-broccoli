import React, { useState, useEffect, useRef } from "react"
import { Link, useNavigate } from "react-router-dom"
import { useAuth } from "../contexts/Auth"
import {
  FiUser,
  FiLogOut,
  FiHome,
  FiBook,
  FiCalendar,
  FiChevronDown,
} from "react-icons/fi"
import "../contexts/style.css"

const Navbar = () => {
  // ALL HOOKS MUST BE AT THE TOP - NEVER CONDITIONAL
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const dropdownRef = useRef(null)

  // Handle profile click
  const handleProfileClick = (e) => {
    e.preventDefault()
    e.stopPropagation()
    setDropdownOpen(false)
    navigate("/profile")
  }

  // Handle logout
  const handleLogout = async (e) => {
    e.preventDefault()
    e.stopPropagation()
    try {
      await logout()
      setDropdownOpen(false)
      navigate("/login")
    } catch (error) {
      console.error("Logout error:", error)
    }
  }

  // Toggle dropdown
  const toggleDropdown = (e) => {
    e.preventDefault()
    e.stopPropagation()
    setDropdownOpen(!dropdownOpen)
  }

  // Get profile image
  const getUserProfileImage = () => {
    // Use profileImage from user context only
    return user?.profileImage || null
  }

  // Close dropdown when clicking outside - useEffect ALWAYS runs
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false)
      }
    }

    if (dropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside)
      return () => {
        document.removeEventListener("mousedown", handleClickOutside)
      }
    }

    // Always return a cleanup function, even if empty
    return () => {}
  }, [dropdownOpen])

  const profileImage = getUserProfileImage()

  return (
    <nav className="navbar glassmorphism" aria-label="Main Navigation">
      <div className="container">
        <div className="navbar-content">
          <Link
            to="/"
            className="navbar-brand"
            tabIndex={0}
            aria-label="Fantastic Broccoli Home"
          >
            <span className="brand-icon">🥦</span>
            <span className="brand-title">FantasticBroccoli</span>
          </Link>

          <nav className="main-nav-links" aria-label="Primary">
            <ul className="navbar-links">
              <li>
                <Link
                  to="/"
                  className="btn btn-outline"
                  tabIndex={0}
                  aria-label="Home"
                >
                  <FiHome style={{ marginRight: 6 }} /> Home
                </Link>
              </li>
              <li>
                <Link
                  to="/recipes"
                  className="btn btn-outline"
                  tabIndex={0}
                  aria-label="Recipes"
                >
                  <FiBook style={{ marginRight: 6 }} /> Recipes
                </Link>
              </li>
              {user && (
                <>
                  <li>
                    <Link
                      to="/meal-planner"
                      className="btn btn-outline"
                      tabIndex={0}
                      aria-label="Meal Planner"
                    >
                      <FiCalendar style={{ marginRight: 6 }} /> Meal Planner
                    </Link>
                  </li>
                </>
              )}
            </ul>
          </nav>

          <div className="navbar-auth">
            {user ? (
              <div className="user-menu" ref={dropdownRef}>
                <div className="dropdown-container">
                  <button
                    className="profile-button"
                    onClick={toggleDropdown}
                    aria-expanded={dropdownOpen}
                    aria-haspopup="true"
                  >
                    {profileImage ? (
                      <img
                        src={profileImage}
                        alt="Profile"
                        className="navbar-avatar"
                        onError={(e) => {
                          e.target.style.display = "none"
                        }}
                      />
                    ) : (
                      <FiUser
                        style={{
                          marginRight: 8,
                          fontSize: 20,
                          color: "#10b981",
                        }}
                      />
                    )}
                    <span className="username">
                      {user.fullName ||
                        `${user.firstName} ${user.lastName}` ||
                        user.username}
                    </span>
                    <FiChevronDown
                      style={{
                        marginLeft: 8,
                        fontSize: 16,
                      }}
                    />
                  </button>

                  {dropdownOpen && (
                    <div className="dropdown-menu">
                      <button
                        onClick={handleProfileClick}
                        className="dropdown-item"
                        aria-label="View Profile"
                      >
                        <FiUser style={{ marginRight: 8 }} />
                        My Profile
                      </button>
                      <div className="dropdown-divider"></div>
                      <button
                        onClick={handleLogout}
                        className="dropdown-item logout-item"
                        aria-label="Logout"
                      >
                        <FiLogOut style={{ marginRight: 8 }} />
                        Logout
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="auth-links">
                <Link
                  to="/register"
                  className="btn btn-outline"
                  tabIndex={0}
                  aria-label="Register"
                >
                  Register
                </Link>
                <Link
                  to="/login"
                  className="btn btn-primary"
                  tabIndex={0}
                  aria-label="Sign In"
                >
                  Sign In
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}

export default Navbar
