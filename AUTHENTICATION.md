# Authentication System - Fantastic Broccoli

## 🔐 Mock Authentication System

This application includes a **mock authentication system** that simulates user registration and login functionality for demonstration purposes. The system stores user data locally in the browser's localStorage.

## 🚀 How It Works

### Registration Process

1. **User fills out registration form** with name, email, and password
2. **Client-side validation** ensures all fields are properly filled
3. **System attempts API call** to backend server (if available)
4. **Fallback to mock registration** if API is unavailable
5. **User data stored locally** in browser's localStorage
6. **Mock token generated** and user is automatically logged in

### Login Process

1. **User enters email and password**
2. **System attempts API call** to backend server (if available)
3. **Fallback to mock login** checks against locally stored users
4. **Mock token generated** and user session established

### Data Storage

- **Registered users**: Stored in `localStorage.registeredUsers`
- **Auth token**: Stored in `localStorage.token`
- **Session persistence**: Users remain logged in between browser sessions

## 🧪 Testing the Authentication

### To Test Registration:

1. Go to `/register`
2. Fill out the form with:
   - **Name**: Your full name
   - **Email**: Any valid email format
   - **Password**: At least 6 characters
   - **Confirm Password**: Must match password
3. Click "Create Account"
4. You'll be automatically logged in and redirected to home page

### To Test Login:

1. First register a user (see above)
2. Log out using the logout button
3. Go to `/login`
4. Use the same email and any password (demo mode accepts any password)
5. Click "Sign In"

## 🔧 Technical Implementation

### AuthContext Features:

- **Automatic fallback**: Tries API first, falls back to mock system
- **Token management**: Handles both real and mock JWT tokens
- **User persistence**: Maintains user session across page reloads
- **Error handling**: Provides meaningful error messages

**Note**: The authentication context is implemented in `src/contexts/Auth.js`

### Security Note:

This is a **DEMO SYSTEM** for frontend development. In production:

- Passwords should be hashed and salted
- Authentication should use secure backend APIs
- Tokens should have expiration and refresh mechanisms
- User data should be stored in a secure database

## 🎯 Features

- ✅ **User Registration** with validation
- ✅ **User Login** with error handling
- ✅ **Session Management** with token persistence
- ✅ **Protected Routes** requiring authentication
- ✅ **User Profile** displaying user information
- ✅ **Logout Functionality** clearing session data

## 📱 User Experience

- **Visual feedback** for loading states
- **Clear error messages** for validation failures
- **Password visibility toggle** for better UX
- **Form validation** with helpful error messages
- **Demo information boxes** explaining the mock system

---

**Note**: This mock authentication system is perfect for frontend development and demos, but should be replaced with a proper backend authentication system for production use.
