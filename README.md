# Fantastic Broccoli - Healthy Recipe Platform

A modern, full-stack React application for discovering, organizing, and tracking healthy recipes. This comprehensive platform combines a responsive React frontend with a robust Express.js backend and MongoDB database to help users manage their healthy eating journey.

## 🚀 Features

### 🏠 **Home Page**

- Beautiful hero section with gradient backgrounds
- Feature highlights and statistics
- Call-to-action buttons for user engagement
- Responsive design with mobile-first approach

### 🔐 **Authentication**

- User registration and login
- JWT token-based authentication
- Protected routes for authenticated users
- Password visibility toggle and form validation

### 📖 **Recipe Discovery**

- Browse and search through healthy recipes from MongoDB database
- Filter by category, calories, and cooking time
- Recipe cards with detailed information
- Interactive search with real-time filtering
- Recipe tags and difficulty levels
- Real-time data from backend API

### 📋 **Recipe Details**

- Comprehensive recipe information
- Adjustable serving sizes with automatic ingredient scaling
- Step-by-step cooking instructions
- Nutritional information display
- Interactive ingredient checklist
- Chef's tips and recommendations

### 📅 **Meal Planner**

- Weekly meal planning interface
- Drag-and-drop recipe assignment using real recipes from database
- Daily and weekly calorie tracking
- Visual meal plan grid
- Recipe selection modal
- Local storage for meal plan persistence

### 👤 **User Profile**

- Personal dashboard with progress tracking
- Weight loss journey visualization
- Favorite recipes management
- User profiles and favorite recipes
- Progress statistics and charts

## 🛠 Tech Stack

### Frontend

- **Framework**: React 18.2.0
- **Routing**: React Router DOM 6.8.1
- **HTTP Client**: Axios 1.10.0
- **Styling**: CSS3 with custom properties and flexbox/grid
- **Icons**: React Icons (Feather Icons)
- **Fonts**: Inter from Google Fonts
- **Build Tool**: Create React App

### Backend

- **Runtime**: Node.js
- **Framework**: Express.js 4.18.2
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT (JSON Web Tokens)
- **Security**: Helmet, CORS, bcryptjs
- **Validation**: Express Validator
- **File Upload**: Multer
- **Development**: Nodemon

### Database

- **MongoDB**: Document-based NoSQL database
- **Collections**: Users, Recipes, Categories
- **Features**: Full-text search, aggregation, indexing

## 🚀 Getting Started

### Prerequisites

- Node.js (v14 or higher)
- MongoDB (local installation or MongoDB Atlas account)
- npm or yarn package manager

### Installation

1. **Clone the repository**:

   ```bash
   git clone <repository-url>
   cd fantastic-broccoli
   ```

2. **Install frontend dependencies**:

   ```bash
   npm install
   ```

3. **Install backend dependencies**:

   ```bash
   cd backend
   npm install
   cd ..
   ```

4. **Set up environment variables**:

   Create `.env` files in both root and backend directories:

   **Root `.env`**:

   ```
   REACT_APP_API_URL=http://localhost:3004/api
   ```

   **Backend `.env`**:

   ```
   PORT=3004
   MONGODB_URI=mongodb://localhost:27017/fantastic-broccoli
   JWT_SECRET=your-jwt-secret-key
   JWT_EXPIRES_IN=7d
   NODE_ENV=development
   ```

5. **Start MongoDB**:

   ```bash
   # If using local MongoDB
   mongod

   # Or ensure MongoDB Atlas connection is configured
   ```

6. **Seed the database** (optional):

   ```bash
   cd backend
   node seed.js
   cd ..
   ```

7. **Start both servers**:

   ```bash
   # Start both frontend and backend (recommended)
   ./start-dev.sh

   # Or start individually:
   # Backend (in backend/ directory)
   npm start

   # Frontend (in root directory)
   npm start
   ```

8. **Open your browser** and navigate to `http://localhost:3000`

### Port Configuration

- **Frontend App**: `http://localhost:3000`
- **Backend API**: `http://localhost:3004/api`
- **MongoDB**: `mongodb://localhost:27017/fantastic-broccoli`

### Available Scripts

#### Frontend

- `npm start` - Runs the React app in development mode
- `npm run build` - Builds the app for production
- `npm test` - Launches the test runner

#### Backend

- `npm start` - Starts the Express server
- `npm run dev` - Starts server with nodemon (auto-restart)
- `node seed.js` - Seeds database with sample data

#### Full-Stack

- `./start-dev.sh` - Starts both frontend and backend servers

## 📱 Responsive Design

The application is fully responsive and works seamlessly across desktop, tablet, and mobile devices.

## 🗂 Project Structure

```
fantastic-broccoli/
├── src/                    # React frontend source
│   ├── components/         # Reusable UI components
│   ├── contexts/          # React contexts (Auth, etc.)
│   ├── hooks/             # Custom React hooks
│   ├── pages/             # Page components
│   ├── services/          # API services
│   └── App.js             # Main app component
├── backend/               # Express.js backend
│   ├── models/            # Mongoose models
│   ├── routes/            # API routes
│   ├── middleware/        # Express middleware
│   ├── server.js          # Express server
│   └── seed.js            # Database seed script
├── public/                # Static assets
│   └── recipe-images/     # Recipe images
└── build/                 # Production build
```

## 🔧 API Endpoints

### Recipes

- `GET /api/recipes` - Get all recipes
- `GET /api/recipes/:id` - Get recipe by ID
- `GET /api/recipes/search` - Search recipes
- `GET /api/recipes/category/:category` - Get recipes by category
- `POST /api/recipes` - Create new recipe (auth required)
- `PUT /api/recipes/:id` - Update recipe (auth required)
- `DELETE /api/recipes/:id` - Delete recipe (auth required)

### Categories

- `GET /api/categories` - Get all categories
- `POST /api/categories` - Create category (admin only)

### Authentication

- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/profile` - Get user profile (auth required)

### Nutrition

- `GET /api/nutrition/analyze` - Analyze recipe nutrition

---

**Built with ❤️ for healthy living and nutritious cooking!**
