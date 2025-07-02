const mongoose = require("mongoose")
const bcrypt = require("bcryptjs")
const User = require("./models/User")
const Category = require("./models/Category")
const Recipe = require("./models/Recipe")
require("dotenv").config()

const seedData = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(
      process.env.MONGODB_URI || "mongodb://localhost:27017/fantastic-broccoli"
    )
    console.log("Connected to MongoDB")

    // Clear existing data
    await User.deleteMany({})
    await Category.deleteMany({})
    await Recipe.deleteMany({})
    console.log("Cleared existing data")

    // Create admin user
    const adminPassword = await bcrypt.hash("admin123", 12)
    const admin = new User({
      username: "admin",
      email: "admin@healthycookbook.com",
      password: adminPassword,
      firstName: "Admin",
      lastName: "User",
      role: "admin",
    })
    await admin.save()
    console.log("Created admin user")

    // Create sample users
    const userPassword = await bcrypt.hash("user123", 12)
    const users = [
      {
        username: "healthyguru",
        email: "guru@healthycookbook.com",
        password: userPassword,
        firstName: "Healthy",
        lastName: "Guru",
        bio: "Passionate about healthy living and nutritious recipes",
        dietaryPreferences: ["vegetarian", "gluten-free"],
      },
      {
        username: "fitnesschef",
        email: "chef@healthycookbook.com",
        password: userPassword,
        firstName: "Fitness",
        lastName: "Chef",
        bio: "Professional chef specializing in healthy, delicious meals",
        dietaryPreferences: ["high-protein", "low-carb"],
      },
    ]

    const createdUsers = await User.insertMany(users)
    console.log("Created sample users")

    // Create categories
    const categories = [
      {
        name: "Breakfast",
        description: "Healthy breakfast recipes to start your day right",
        icon: "🍳",
        color: "#FF6B6B",
      },
      {
        name: "Lunch",
        description: "Nutritious and satisfying lunch options",
        icon: "🥗",
        color: "#4ECDC4",
      },
      {
        name: "Dinner",
        description: "Wholesome dinner recipes for the whole family",
        icon: "🍽️",
        color: "#45B7D1",
      },
      {
        name: "Snacks",
        description: "Healthy snacks and appetizers",
        icon: "🥜",
        color: "#96CEB4",
      },
      {
        name: "Desserts",
        description: "Guilt-free desserts and sweet treats",
        icon: "🍓",
        color: "#FFEAA7",
      },
      {
        name: "Smoothies",
        description: "Refreshing and nutritious smoothie recipes",
        icon: "🥤",
        color: "#DDA0DD",
      },
      {
        name: "Salads",
        description: "Fresh and vibrant salad combinations",
        icon: "🥬",
        color: "#98FB98",
      },
      {
        name: "Soups",
        description: "Warming and nourishing soup recipes",
        icon: "🍲",
        color: "#F4A460",
      },
    ]

    const createdCategories = await Category.insertMany(categories)
    console.log("Created categories")

    // Create sample recipes
    const recipes = [
      {
        title: "Quinoa Power Bowl",
        description:
          "A nutrient-packed bowl with quinoa, roasted vegetables, and tahini dressing",
        image: "/recipe-images/Quinoa Power Bowl.jpg",
        category: createdCategories[1]._id, // Lunch
        author: createdUsers[0]._id,
        ingredients: [
          { name: "quinoa", amount: 1, unit: "cup", notes: "rinsed" },
          { name: "broccoli", amount: 2, unit: "cup", notes: "chopped" },
          { name: "bell peppers", amount: 1, unit: "piece", notes: "sliced" },
          { name: "carrots", amount: 2, unit: "piece", notes: "julienned" },
          { name: "chickpeas", amount: 1, unit: "cup", notes: "cooked" },
          { name: "tahini", amount: 2, unit: "tbsp" },
          { name: "lemon juice", amount: 1, unit: "tbsp" },
          { name: "olive oil", amount: 1, unit: "tbsp" },
        ],
        instructions: [
          {
            stepNumber: 1,
            instruction: "Cook quinoa according to package directions",
            estimatedTime: 15,
          },
          {
            stepNumber: 2,
            instruction: "Roast vegetables at 400°F for 20 minutes",
            estimatedTime: 20,
          },
          {
            stepNumber: 3,
            instruction:
              "Whisk tahini, lemon juice, and olive oil for dressing",
            estimatedTime: 2,
          },
          {
            stepNumber: 4,
            instruction: "Combine quinoa, vegetables, and chickpeas in bowl",
            estimatedTime: 3,
          },
          {
            stepNumber: 5,
            instruction: "Drizzle with tahini dressing and serve",
            estimatedTime: 1,
          },
        ],
        nutrition: {
          calories: 420,
          protein: 18,
          carbohydrates: 62,
          fat: 14,
          fiber: 12,
          sugar: 8,
          sodium: 320,
        },
        servings: 2,
        prepTime: 15,
        cookTime: 25,
        difficulty: "easy",
        dietaryTags: ["vegetarian", "vegan", "gluten-free", "high-protein"],
        healthScore: 85,
        isFeatured: true,
      },
      {
        title: "Green Goddess Smoothie",
        description:
          "A creamy, nutrient-dense smoothie packed with greens and tropical flavors",
        image: "/recipe-images/Green Goddess Smoothie.jpg",
        category: createdCategories[5]._id, // Smoothies
        author: createdUsers[0]._id,
        ingredients: [
          { name: "spinach", amount: 2, unit: "cup", notes: "fresh" },
          { name: "banana", amount: 1, unit: "piece", notes: "frozen" },
          { name: "mango", amount: 0.5, unit: "cup", notes: "frozen chunks" },
          {
            name: "coconut milk",
            amount: 1,
            unit: "cup",
            notes: "unsweetened",
          },
          { name: "chia seeds", amount: 1, unit: "tbsp" },
          { name: "lime juice", amount: 1, unit: "tbsp" },
          { name: "mint", amount: 5, unit: "piece", notes: "fresh leaves" },
        ],
        instructions: [
          {
            stepNumber: 1,
            instruction: "Add all ingredients to blender",
            estimatedTime: 2,
          },
          {
            stepNumber: 2,
            instruction: "Blend until smooth and creamy",
            estimatedTime: 2,
          },
          {
            stepNumber: 3,
            instruction: "Add ice if desired consistency is thinner",
            estimatedTime: 1,
          },
          {
            stepNumber: 4,
            instruction: "Pour into glasses and serve immediately",
            estimatedTime: 1,
          },
        ],
        nutrition: {
          calories: 245,
          protein: 6,
          carbohydrates: 42,
          fat: 8,
          fiber: 10,
          sugar: 28,
          sodium: 45,
        },
        servings: 1,
        prepTime: 5,
        cookTime: 0,
        difficulty: "easy",
        dietaryTags: ["vegetarian", "vegan", "gluten-free", "dairy-free"],
        healthScore: 90,
        isFeatured: true,
      },
      {
        title: "Mediterranean Stuffed Peppers",
        description:
          "Colorful bell peppers filled with quinoa, vegetables, and feta cheese",
        image: "/recipe-images/Mediterranean Stuffed Peppers.jpg",
        category: createdCategories[2]._id, // Dinner
        author: createdUsers[1]._id,
        ingredients: [
          {
            name: "bell peppers",
            amount: 4,
            unit: "piece",
            notes: "tops cut and seeded",
          },
          { name: "quinoa", amount: 0.5, unit: "cup", notes: "cooked" },
          { name: "tomatoes", amount: 2, unit: "piece", notes: "diced" },
          { name: "cucumber", amount: 1, unit: "piece", notes: "diced" },
          { name: "red onion", amount: 0.25, unit: "cup", notes: "minced" },
          { name: "feta cheese", amount: 0.5, unit: "cup", notes: "crumbled" },
          { name: "olive oil", amount: 2, unit: "tbsp" },
          { name: "lemon juice", amount: 1, unit: "tbsp" },
          { name: "oregano", amount: 1, unit: "tsp", notes: "dried" },
        ],
        instructions: [
          {
            stepNumber: 1,
            instruction: "Preheat oven to 375°F",
            estimatedTime: 5,
          },
          {
            stepNumber: 2,
            instruction: "Mix quinoa, tomatoes, cucumber, onion, and feta",
            estimatedTime: 5,
          },
          {
            stepNumber: 3,
            instruction: "Whisk olive oil, lemon juice, and oregano",
            estimatedTime: 2,
          },
          {
            stepNumber: 4,
            instruction: "Toss quinoa mixture with dressing",
            estimatedTime: 2,
          },
          {
            stepNumber: 5,
            instruction: "Stuff peppers with mixture and place in baking dish",
            estimatedTime: 8,
          },
          {
            stepNumber: 6,
            instruction: "Bake for 25-30 minutes until peppers are tender",
            estimatedTime: 30,
          },
        ],
        nutrition: {
          calories: 185,
          protein: 8,
          carbohydrates: 22,
          fat: 9,
          fiber: 4,
          sugar: 12,
          sodium: 280,
        },
        servings: 4,
        prepTime: 20,
        cookTime: 30,
        difficulty: "medium",
        dietaryTags: ["vegetarian", "gluten-free", "mediterranean"],
        healthScore: 80,
      },
      {
        title: "Overnight Chia Pudding",
        description:
          "A make-ahead breakfast loaded with omega-3s and customizable toppings",
        image: "/recipe-images/Overnight Chia Pudding.jpg",
        category: createdCategories[0]._id, // Breakfast
        author: createdUsers[0]._id,
        ingredients: [
          { name: "chia seeds", amount: 3, unit: "tbsp" },
          { name: "almond milk", amount: 1, unit: "cup", notes: "unsweetened" },
          { name: "maple syrup", amount: 1, unit: "tbsp" },
          { name: "vanilla extract", amount: 0.5, unit: "tsp" },
          { name: "berries", amount: 0.5, unit: "cup", notes: "mixed" },
          { name: "almonds", amount: 2, unit: "tbsp", notes: "sliced" },
          {
            name: "coconut flakes",
            amount: 1,
            unit: "tbsp",
            notes: "unsweetened",
          },
        ],
        instructions: [
          {
            stepNumber: 1,
            instruction:
              "Whisk chia seeds, almond milk, maple syrup, and vanilla",
            estimatedTime: 2,
          },
          {
            stepNumber: 2,
            instruction: "Let sit for 5 minutes, then whisk again",
            estimatedTime: 6,
          },
          {
            stepNumber: 3,
            instruction: "Cover and refrigerate overnight",
            estimatedTime: 480,
          },
          {
            stepNumber: 4,
            instruction:
              "Top with berries, almonds, and coconut before serving",
            estimatedTime: 2,
          },
        ],
        nutrition: {
          calories: 220,
          protein: 8,
          carbohydrates: 25,
          fat: 12,
          fiber: 14,
          sugar: 15,
          sodium: 65,
        },
        servings: 1,
        prepTime: 10,
        cookTime: 0,
        difficulty: "easy",
        dietaryTags: ["vegetarian", "vegan", "gluten-free", "dairy-free"],
        healthScore: 85,
        isFeatured: true,
      },
      {
        title: "Kale and White Bean Soup",
        description: "A hearty, warming soup packed with nutrients and fiber",
        image: "/recipe-images/Kale and White Bean Soup.jpg",
        category: createdCategories[7]._id, // Soups
        author: createdUsers[1]._id,
        ingredients: [
          { name: "olive oil", amount: 1, unit: "tbsp" },
          { name: "onion", amount: 1, unit: "piece", notes: "diced" },
          { name: "garlic", amount: 3, unit: "clove", notes: "minced" },
          { name: "carrots", amount: 2, unit: "piece", notes: "diced" },
          { name: "celery", amount: 2, unit: "piece", notes: "diced" },
          {
            name: "vegetable broth",
            amount: 4,
            unit: "cup",
            notes: "low-sodium",
          },
          { name: "white beans", amount: 1, unit: "cup", notes: "cooked" },
          { name: "kale", amount: 3, unit: "cup", notes: "chopped" },
          { name: "lemon juice", amount: 1, unit: "tbsp" },
        ],
        instructions: [
          {
            stepNumber: 1,
            instruction: "Heat olive oil in large pot over medium heat",
            estimatedTime: 2,
          },
          {
            stepNumber: 2,
            instruction:
              "Sauté onion, garlic, carrots, and celery for 5 minutes",
            estimatedTime: 5,
          },
          {
            stepNumber: 3,
            instruction: "Add broth and bring to boil",
            estimatedTime: 5,
          },
          {
            stepNumber: 4,
            instruction: "Add beans and simmer for 10 minutes",
            estimatedTime: 10,
          },
          {
            stepNumber: 5,
            instruction: "Stir in kale and cook until wilted",
            estimatedTime: 3,
          },
          {
            stepNumber: 6,
            instruction: "Add lemon juice and season to taste",
            estimatedTime: 2,
          },
        ],
        nutrition: {
          calories: 165,
          protein: 9,
          carbohydrates: 28,
          fat: 4,
          fiber: 8,
          sugar: 6,
          sodium: 180,
        },
        servings: 4,
        prepTime: 15,
        cookTime: 25,
        difficulty: "easy",
        dietaryTags: ["vegetarian", "vegan", "gluten-free", "high-protein"],
        healthScore: 88,
      },
    ]

    for (const recipeData of recipes) {
      const recipe = new Recipe(recipeData)
      recipe.calculateHealthScore()
      await recipe.save()

      // Add to user's created recipes
      await User.findByIdAndUpdate(recipeData.author, {
        $push: { createdRecipes: recipe._id },
      })
    }

    console.log("Created sample recipes")

    // Update category recipe counts
    for (const category of createdCategories) {
      await category.updateRecipeCount()
    }

    console.log("Updated category recipe counts")

    // Add some ratings to recipes
    const allRecipes = await Recipe.find()
    for (const recipe of allRecipes) {
      // Add random ratings
      const numRatings = Math.floor(Math.random() * 5) + 1
      for (let i = 0; i < numRatings; i++) {
        const rating = Math.floor(Math.random() * 3) + 3 // 3-5 stars
        const randomUser =
          createdUsers[Math.floor(Math.random() * createdUsers.length)]

        recipe.ratings.push({
          user: randomUser._id,
          rating,
          comment: `Great recipe! Rating: ${rating}/5`,
        })
      }

      recipe.updateAverageRating()
      await recipe.save()
    }

    console.log("Added ratings to recipes")

    console.log("🎉 Database seeded successfully!")
    console.log("\nSample accounts:")
    console.log("Admin: admin@healthycookbook.com / admin123")
    console.log("User 1: guru@healthycookbook.com / user123")
    console.log("User 2: chef@healthycookbook.com / user123")

    mongoose.connection.close()
  } catch (error) {
    console.error("Seeding error:", error)
    process.exit(1)
  }
}

seedData()
