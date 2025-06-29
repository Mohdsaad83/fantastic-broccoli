import React from "react"
import { Routes, Route } from "react-router-dom"
import { AuthProvider } from "./contexts/Auth"
import Navbar from "./components/Navbar"
import Home from "./pages/Home"
import Recipes from "./pages/Recipes"
import RecipeDetails from "./pages/RecipeDetails"
import MealPlanner from "./pages/MealPlanner"
import Profile from "./pages/Profile"
import Login from "./pages/Login"
import Register from "./pages/Register"
import ProtectedRoute from "./components/ProtectedRoute"

function App() {
  return (
    <AuthProvider>
      <div className="App">
        <Navbar />
        <main>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/recipes" element={<Recipes />} />
            <Route path="/recipes/:id" element={<RecipeDetails />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
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
          </Routes>
        </main>
      </div>
    </AuthProvider>
  )
}

export default App
