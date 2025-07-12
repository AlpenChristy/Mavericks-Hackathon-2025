## 💡 Problem Statement
# 👕 ReWear – Community Clothing Exchange

Welcome to *ReWear, an innovative platform designed to foster sustainable fashion through a **community-driven clothing exchange*. With environmental awareness on the rise, ReWear empowers individuals to give their gently used clothing a second life, while also finding stylish, sustainable alternatives — all within a trusted community.

---

## 🎥 Demo Video

📺 [Watch the Project Demo](https://drive.google.com/file/d/1s4hY8tCCxfrUGkvLEan5E4pY68r7Cdff/view?usp=sharing)

---

## 🧠 Team Information

*Team Name:* Mavericks

*Team Members:*
- 👩‍💻 Isha Solanki
- 👨‍💻 Alpen Christy

## Prerequisites

1. **PostgreSQL**: Make sure PostgreSQL is installed and running on your system
2. **pgAdmin**: Install pgAdmin for database management
3. **Node.js**: Ensure Node.js is installed

## Database Setup

### 1. Create Database

1. Open pgAdmin
2. Connect to your PostgreSQL server
3. Create a new database named `rewear_app`

### 2. Run Database Migration

1. In pgAdmin, open the Query Tool
2. Copy and paste the contents of `database_setup.sql`
3. Execute the script to create all necessary tables

Alternatively, you can run the SQL commands directly in your PostgreSQL terminal:

```sql
-- Connect to rewear_app and run the database_setup.sql file
```

## Environment Configuration

The application uses the following database credentials (hardcoded for simplicity):

- **DB_USER**: postgres
- **DB_PASSWORD**: 1234
- **DB_HOST**: localhost
- **DB_PORT**: 5432
- **DB_NAME**: rewear_app
- **JWT_SECRET**: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsImlhdCI6MTc1MjA4NDg4OH0.hhp8H4HrW13Nknh0l88XR-zTfnTc79GumxRlR3ojoLE

## Installation

1. Install dependencies:
```bash
npm install
```

## Running the Application

### Option 1: Run Frontend and Backend Separately

1. Start the backend server:
```bash
npm run server
```

2. In a new terminal, start the frontend:
```bash
npm run dev
```

### Option 2: Run Both Together

```bash
npm run dev:full
```

This will start both the backend server (port 3001) and the frontend development server (port 5173).

## API Endpoints

The backend provides the following endpoints:

- `POST /api/auth/signup` - User registration
- `POST /api/auth/signin` - User login
- `GET /api/auth/profile` - Get user profile (requires authentication)
- `PUT /api/auth/profile` - Update user profile (requires authentication)
- `GET /api/items` - Get all available items
- `POST /api/items` - Create new item (requires authentication)
- `GET /api/categories` - Get all categories

## Features

- User authentication with JWT tokens
- User registration and login
- Profile management
- Item management (create, browse)
- Category system
- Points system for users

## Database Schema

The application uses the following main tables:

- **users**: User accounts and profiles (authentication)
- **items**: Items available for swapping
- **swap_requests**: Swap requests between users
- **point_transactions**: Point transaction history
- **favorites**: User favorite items
- **categories**: Item categories

## Troubleshooting

1. **Database Connection Error**: Ensure PostgreSQL is running and the credentials are correct
2. **Port Already in Use**: Make sure port 3001 is available for the backend server
3. **CORS Issues**: The backend is configured to allow CORS from the frontend

## Security Notes

- JWT tokens are stored in localStorage
- Passwords are hashed using bcrypt
- Database credentials are hardcoded for development (should be environment variables in production) 
