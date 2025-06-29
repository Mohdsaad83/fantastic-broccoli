import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react"
import axios from "axios"

const AuthContext = createContext()

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  const logout = () => {
    localStorage.removeItem("token")
    delete axios.defaults.headers.common["Authorization"]
    setUser(null)
  }

  const fetchUserProfile = useCallback(async () => {
    try {
      // Try API call first
      const response = await axios.get("/api/users/profile")
      setUser(response.data)
    } catch (error) {
      console.log("API profile fetch failed, using mock authentication")

      // Check for mock token
      const token = localStorage.getItem("token")
      if (token && token.startsWith("mock_token_")) {
        // Extract user ID from mock token
        const userId = parseInt(token.split("_")[2])
        const existingUsers = JSON.parse(
          localStorage.getItem("registeredUsers") || "[]"
        )
        const user = existingUsers.find((u) => u.id === userId)

        if (user) {
          setUser(user)
        } else {
          logout()
        }
      } else {
        logout()
      }
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    const token = localStorage.getItem("token")
    if (token) {
      axios.defaults.headers.common["Authorization"] = `Bearer ${token}`
      // Verify token and get user info
      fetchUserProfile()
    } else {
      setLoading(false)
    }
  }, [fetchUserProfile])

  const login = async (email, password) => {
    try {
      // Try API call first
      const response = await axios.post("/api/auth/login", { email, password })
      const { token, user } = response.data

      localStorage.setItem("token", token)
      axios.defaults.headers.common["Authorization"] = `Bearer ${token}`
      setUser(user)

      return { success: true }
    } catch (error) {
      // Fallback to mock login for demo purposes
      console.log("API login failed, using mock login")

      // Check if user exists in localStorage
      const existingUsers = JSON.parse(
        localStorage.getItem("registeredUsers") || "[]"
      )
      const existingUser = existingUsers.find((user) => user.email === email)

      if (!existingUser) {
        return {
          success: false,
          error: "No account found with this email address",
        }
      }

      // For demo purposes, accept any password for registered users
      // In a real app, you'd verify the password hash

      // Generate mock token and set user
      const mockToken = `mock_token_${existingUser.id}_${Date.now()}`
      localStorage.setItem("token", mockToken)
      axios.defaults.headers.common["Authorization"] = `Bearer ${mockToken}`
      setUser(existingUser)

      return { success: true }
    }
  }

  const register = async (name, email, password) => {
    try {
      // Try API call first
      const response = await axios.post("/api/auth/register", {
        name,
        email,
        password,
      })
      const { token, user } = response.data

      localStorage.setItem("token", token)
      axios.defaults.headers.common["Authorization"] = `Bearer ${token}`
      setUser(user)

      return { success: true }
    } catch (error) {
      // Fallback to mock registration for demo purposes
      console.log("API registration failed, using mock registration")

      // Check if user already exists in localStorage
      const existingUsers = JSON.parse(
        localStorage.getItem("registeredUsers") || "[]"
      )
      const userExists = existingUsers.find((user) => user.email === email)

      if (userExists) {
        return {
          success: false,
          error: "User with this email already exists",
        }
      }

      // Create new user
      const newUser = {
        id: Date.now(), // Simple ID generation
        name,
        email,
        createdAt: new Date().toISOString(),
      }

      // Add to registered users
      existingUsers.push(newUser)
      localStorage.setItem("registeredUsers", JSON.stringify(existingUsers))

      // Generate mock token and set user
      const mockToken = `mock_token_${newUser.id}_${Date.now()}`
      localStorage.setItem("token", mockToken)
      axios.defaults.headers.common["Authorization"] = `Bearer ${mockToken}`
      setUser(newUser)

      return { success: true }
    }
  }

  const value = {
    user,
    login,
    register,
    logout,
    loading,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
