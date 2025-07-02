import React, { createContext, useContext, useState, useEffect } from "react"
import axios from "axios"

const AuthContext = createContext()

// Create axios instance with proper base URL
const api = axios.create({
  baseURL: (process.env.REACT_APP_API_URL || "http://localhost:3004") + "/api",
  headers: {
    "Content-Type": "application/json",
  },
})

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  // Set up token in axios instance
  useEffect(() => {
    const token = localStorage.getItem("token")
    if (token) {
      api.defaults.headers.common["Authorization"] = `Bearer ${token}`
    }
  }, [])

  // Check if user is logged in on app start
  useEffect(() => {
    checkAuthStatus()
  }, [])

  const checkAuthStatus = async () => {
    try {
      const token = localStorage.getItem("token")
      if (!token) {
        setLoading(false)
        return
      }

      const response = await api.get("/auth/me")

      if (response.data.success) {
        setUser(response.data.user)
        setIsAuthenticated(true)
      } else {
        localStorage.removeItem("token")
        delete api.defaults.headers.common["Authorization"]
      }
    } catch (error) {
      console.error("Auth check failed:", error)
      localStorage.removeItem("token")
      delete api.defaults.headers.common["Authorization"]
    } finally {
      setLoading(false)
    }
  }

  // Login function
  const login = async (email, password) => {
    try {
      // Validate inputs before sending
      if (
        !email ||
        !password ||
        email.trim() === "" ||
        password.trim() === ""
      ) {
        console.error("❌ Frontend: Empty credentials provided")
        throw new Error("Email and password are required")
      }

      const response = await api.post("/auth/login", {
        email: email.trim(),
        password: password.trim(),
      })

      if (response.data.success) {
        const { token, user } = response.data

        // Store token in localStorage
        localStorage.setItem("token", token)

        // Set axios default header
        api.defaults.headers.common["Authorization"] = `Bearer ${token}`

        // Update state
        setUser(user)
        setIsAuthenticated(true)

        return { success: true, user }
      } else {
        throw new Error(response.data.message || "Login failed")
      }
    } catch (error) {
      console.error("Login error:", error)
      throw new Error(error.response?.data?.message || "Login failed")
    }
  }

  // Register function
  const register = async (userData) => {
    try {
      const response = await api.post("/auth/register", userData)

      if (response.data.success) {
        const { token, user } = response.data

        // Store token in localStorage
        localStorage.setItem("token", token)

        // Set axios default header
        api.defaults.headers.common["Authorization"] = `Bearer ${token}`

        // Update state
        setUser(user)
        setIsAuthenticated(true)

        return { success: true, user }
      } else {
        throw new Error(response.data.message || "Registration failed")
      }
    } catch (error) {
      console.error("Registration error:", error)
      throw new Error(error.response?.data?.message || "Registration failed")
    }
  }

  // Update user function
  const updateUser = async (userData) => {
    try {
      const response = await api.put("/api/auth/profile", userData)

      if (response.data.success) {
        const updatedUser = response.data.user

        // Update state
        setUser(updatedUser)

        return { success: true, user: updatedUser }
      } else {
        throw new Error(response.data.message || "Update failed")
      }
    } catch (error) {
      console.error("Update user error:", error)
      throw new Error(
        error.response?.data?.message || "Failed to update profile"
      )
    }
  }

  // Change password function
  const changePassword = async (currentPassword, newPassword) => {
    try {
      const response = await api.put("/api/auth/change-password", {
        currentPassword,
        newPassword,
      })

      if (response.data.success) {
        return { success: true, message: "Password changed successfully" }
      } else {
        throw new Error(response.data.message || "Password change failed")
      }
    } catch (error) {
      console.error("Change password error:", error)
      throw new Error(
        error.response?.data?.message || "Failed to change password"
      )
    }
  }

  // Delete account function
  const deleteAccount = async () => {
    try {
      const response = await api.delete("/api/auth/account")

      if (response.data.success) {
        // Clear all user data
        localStorage.removeItem("token")
        delete api.defaults.headers.common["Authorization"]

        // Update state
        setUser(null)
        setIsAuthenticated(false)

        return { success: true, message: "Account deleted successfully" }
      } else {
        throw new Error(response.data.message || "Account deletion failed")
      }
    } catch (error) {
      console.error("Delete account error:", error)
      throw new Error(
        error.response?.data?.message || "Failed to delete account"
      )
    }
  }

  // Logout function
  const logout = async () => {
    try {
      // Call logout endpoint (optional)
      await api.post("/api/auth/logout", {})
    } catch (error) {
      console.error("Logout endpoint error:", error)
    } finally {
      // Clear local storage and state regardless of API call success
      localStorage.removeItem("token")
      delete api.defaults.headers.common["Authorization"]
      setUser(null)
      setIsAuthenticated(false)
    }
  }

  const value = {
    user,
    loading,
    isAuthenticated,
    login,
    register,
    updateUser, // Add this
    changePassword, // Add this
    deleteAccount, // Add this
    logout,
    checkAuthStatus,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
