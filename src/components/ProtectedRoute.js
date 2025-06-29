import React from "react"
import { Navigate } from "react-router-dom"
import { useAuth } from "../contexts/Auth"

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="loading">
        <div className="spinner"></div>
      </div>
    )
  }

  return user ? children : <Navigate to="/login" />
}

export default ProtectedRoute
