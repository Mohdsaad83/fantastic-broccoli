import React from "react"
import { Routes, Route } from "react-router-dom"
import { AuthProvider, useAuth } from "./contexts/Auth"
import "./font-improvements.css"
import Navbar from "./components/Navbar"
import Home from "./pages/Home"
import Recipes from "./pages/Recipes"
import RecipeDetails from "./pages/RecipeDetails"
import CreateRecipe from "./pages/CreateRecipe"
import EditRecipe from "./pages/EditRecipe"
import MealPlanner from "./pages/MealPlanner"
import Profile from "./pages/Profile"
import Login from "./pages/Login"
import Register from "./pages/Register"
import Logout from "./pages/Logout"
import ProtectedRoute from "./components/ProtectedRoute"

function AppContent() {
  const { loading } = useAuth()

  if (loading) {
    return (
      <div className="loading">
        <div className="spinner"></div>
        <p>Loading...</p>
      </div>
    )
  }

  return (
    <div className="App">
      <Navbar />
      <main>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/recipes" element={<Recipes />} />
          <Route path="/recipes/:id" element={<RecipeDetails />} />
          <Route path="/recipe/:id" element={<RecipeDetails />} />
          <Route
            path="/create-recipe"
            element={
              <ProtectedRoute>
                <CreateRecipe />
              </ProtectedRoute>
            }
          />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/logout" element={<Logout />} />
          <Route
            path="/meal-planner"
            element={
              <ProtectedRoute>
                <MealPlanner />
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            }
          />
          <Route
            path="/edit-recipe/:id"
            element={
              <ProtectedRoute>
                <EditRecipe />
              </ProtectedRoute>
            }
          />
        </Routes>
      </main>
    </div>
  )
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  )
}

export default App
