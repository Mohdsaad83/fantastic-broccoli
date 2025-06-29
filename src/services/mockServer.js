// Mock API Server Setup Instructions
// This file explains how to set up a simple mock server for development

/*
To set up a mock API server for development, you can use one of these approaches:

1. JSON Server (Recommended for quick setup):
   npm install -g json-server
   
   Create a db.json file with your recipe data:
   {
     "recipes": [
       // Your recipe data here
     ],
     "users": [],
     "favorites": []
   }
   
   Run: json-server --watch db.json --port 3001

2. Express.js server:
   Create a simple Express server in a separate folder
   
3. Use MSW (Mock Service Worker):
   npm install msw --save-dev
   
   Set up request handlers for API endpoints

4. Backend Integration:
   - Replace the API_URL in .env with your actual backend URL
   - Ensure your backend has the following endpoints:
     - GET /api/recipes
     - GET /api/recipes/:id
     - GET /api/recipes/search?search=term
     - GET /api/recipes/category/:category
     - GET /api/recipes/featured
     - POST /api/recipes/:id/favorite
     - DELETE /api/recipes/:id/favorite
     - GET /api/recipes/favorites
     - POST /api/recipes/:id/rate
     - GET /api/recipes/categories
     - GET /api/recipes/tags

The app will gracefully fall back to sample data if the API is unavailable.
*/

export const API_ENDPOINTS = {
  recipes: "/recipes",
  recipeById: (id) => `/recipes/${id}`,
  searchRecipes: "/recipes/search",
  recipesByCategory: (category) => `/recipes/category/${category}`,
  featuredRecipes: "/recipes/featured",
  addToFavorites: (id) => `/recipes/${id}/favorite`,
  removeFromFavorites: (id) => `/recipes/${id}/favorite`,
  favoriteRecipes: "/recipes/favorites",
  rateRecipe: (id) => `/recipes/${id}/rate`,
  categories: "/recipes/categories",
  tags: "/recipes/tags",
}

export default API_ENDPOINTS
