# News Explorer - Backend API

RESTful API backend for the News Explorer application. Handles user authentication, article management, and data persistence with MongoDB.

## Features

- **User Authentication** - JWT-based registration and login
- **Article Management** - Save, retrieve, and delete news articles
- **Authorization** - Users can only delete their own articles
- **Request Validation** - Input validation with Celebrate/Joi
- **Security** - Password hashing, rate limiting, CORS protection
- **Logging** - Request and error logging with Winston
- **Error Handling** - Centralized error handling middleware

## Technologies

- **Node.js** - JavaScript runtime
- **Express.js** - Web framework
- **MongoDB** - NoSQL database
- **Mongoose** - MongoDB ODM
- **JWT** - JSON Web Tokens for authentication
- **bcrypt** - Password hashing
- **Celebrate/Joi** - Request validation
- **Winston** - Logging
- **express-rate-limit** - Rate limiting
- **Helmet** - Security headers
- **CORS** - Cross-origin resource sharing
- **dotenv** - Environment variables

## Prerequisites

- **Node.js** v14 or higher
- **MongoDB** running locally or MongoDB Atlas account
- **npm** or yarn

## Installation

1. Clone the repository:
  ```bash
  git clone https://github.com/your-username/news-explorer-backend.git
  cd news-explorer-backend

  2. Install dependencies:
  npm install

  3. Create a .env file in the root directory:
  PORT=3000
  DATABASE_URL=mongodb://localhost:27017/news-explorer
  JWT_SECRET=your-secret-key-here
  NODE_ENV=development

  4. Start MongoDB (if running locally):
  # macOS with Homebrew
  brew services start mongodb-community

  # Or run directly
  mongod

  5. Start the development server:
  npm run dev

  The server will run on http://localhost:3000

  Environment Variables

  | Variable     | Description                        | Example                                 |
  |--------------|------------------------------------|-----------------------------------------|
  | PORT         | Server port                        | 3000                                    |
  | DATABASE_URL | MongoDB connection string          | mongodb://localhost:27017/news-explorer |
  | JWT_SECRET   | Secret key for JWT signing         | your-secret-key                         |
  | NODE_ENV     | Environment mode                   | development or production               |


  API Endpoints

  Authentication

  Register User

  POST /signup
  Content-Type: application/json

  {
    "email": "user@example.com",
    "password": "password123",
    "username": "JohnDoe"
  }

  Response (201):
  {
    "message": "User created successfully!",
    "user": {
      "_id": "507f1f77bcf86cd799439011",
      "email": "user@example.com",
      "username": "JohnDoe"
    }
  }

  Validation:
  - Email: Required, valid email format
  - Password: Required, minimum 8 characters
  - Username: Required, 2-30 characters

  ---
  Login User

  POST /signin
  Content-Type: application/json

  {
    "email": "user@example.com",
    "password": "password123"
  }

  Response (200):
  {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }

  ---
  Get Current User

  GET /users/me
  Authorization: Bearer <token>

  Response (200):
  {
    "_id": "507f1f77bcf86cd799439011",
    "email": "user@example.com",
    "username": "JohnDoe"
  }

  Requires: Valid JWT token in Authorization header

  ---
  Articles

  Get User's Saved Articles

  GET /articles
  Authorization: Bearer <token>

  Response (200):
  [
    {
      "_id": "507f1f77bcf86cd799439011",
      "keyword": "technology",
      "title": "Breaking Tech News",
      "text": "Article content here...",
      "date": "2025-01-15T10:30:00.000Z",
      "source": "TechCrunch",
      "link": "https://example.com/article",
      "image": "https://example.com/image.jpg",
      "owner": "507f1f77bcf86cd799439012"
    }
  ]

  Note: Returns articles sorted by newest first (_id descending)

  ---
  Save Article

  POST /articles
  Authorization: Bearer <token>
  Content-Type: application/json

  {
    "keyword": "technology",
    "title": "Breaking Tech News",
    "text": "Article content here...",
    "date": "2025-01-15T10:30:00.000Z",
    "source": "TechCrunch",
    "link": "https://example.com/article",
    "image": "https://example.com/image.jpg"
  }

  Response (201):
  {
    "_id": "507f1f77bcf86cd799439011",
    "keyword": "technology",
    "title": "Breaking Tech News",
    "text": "Article content here...",
    "date": "2025-01-15T10:30:00.000Z",
    "source": "TechCrunch",
    "link": "https://example.com/article",
    "image": "https://example.com/image.jpg",
    "owner": "507f1f77bcf86cd799439012"
  }

  Validation:
  - All fields required
  - link and image must be valid URLs
  - owner automatically set from JWT token

  ---
  Delete Article

  DELETE /articles/:id
  Authorization: Bearer <token>

  Response (200):
  {
    "message": "Article deleted successfully!"
  }

  Authorization: Users can only delete their own articles (403 if not owner)

  ---
  Database Schemas

  User Schema

  {
    email: {
      type: String,
      required: true,
      unique: true,
      validate: isEmail
    },
    password: {
      type: String,
      required: true,
      minlength: 8,
      select: false  // Not returned in queries
    },
    username: {
      type: String,
      required: true,
      minlength: 2,
      maxlength: 30
    }
  }

  Features:
  - Password hashed with bcrypt (salt rounds: 10)
  - Email validated and stored lowercase
  - Password never returned in API responses

  Article Schema

  {
    keyword: {
      type: String,
      required: true
    },
    title: {
      type: String,
      required: true
    },
    text: {
      type: String,
      required: true
    },
    date: {
      type: Date,
      required: true
    },
    source: {
      type: String,
      required: true
    },
    link: {
      type: String,
      required: true,
      validate: isURL
    },
    image: {
      type: String,
      required: true,
      validate: isURL
    },
    owner: {
      type: ObjectId,
      required: true,
      ref: "User"
    }
  }

  Project Structure

  news-explorer-backend/
  ├── controllers/
  │   ├── articles.js      # Article CRUD logic
  │   └── users.js         # User auth logic
  ├── middlewares/
  │   ├── auth.js          # JWT authentication
  │   ├── errorHandler.js  # Centralized error handling
  │   ├── logger.js        # Request/error logging
  │   ├── rateLimiter.js   # Rate limiting
  │   └── validation.js    # Request validation
  ├── models/
  │   ├── article.js       # Article schema
  │   └── user.js          # User schema
  ├── routes/
  │   ├── index.js         # Main routes entry point
  │   ├── articles.js      # Article routes
  │   └── users.js         # User routes
  ├── utils/
  │   ├── config.js        # Configuration
  │   ├── badRequestError.js
  │   ├── conflictError.js
  │   ├── forbiddenError.js
  │   ├── notFoundError.js
  │   ├── unauthorizedError.js
  │   └── success.js       # Success status codes
  ├── logs/                # Winston log files
  │   ├── request.log
  │   └── error.log
  ├── app.js               # Express app setup
  ├── .env                 # Environment variables
  ├── .gitignore
  └── package.json

  Security Features

  Authentication

  - JWT tokens with 7-day expiration
  - Password hashing with bcrypt (10 salt rounds)
  - Token validation on protected routes

  Request Validation

  - Celebrate/Joi validates all request bodies and parameters
  - Email format validation
  - URL validation for links and images
  - MongoDB ObjectId validation for IDs

  Security Headers

  - Helmet adds security headers
  - CORS configured for frontend origin
  - Rate limiting prevents abuse (default limits applied)

  Error Handling

  - Centralized error handler doesn't leak sensitive info
  - Status codes properly set (400, 401, 403, 404, 409, 500)
  - Error logging with Winston to logs/error.log

  Authorization

  - Ownership checks - Users can only delete their own articles
  - Protected routes require valid JWT token

  Error Responses

  All errors follow this format:

  {
    "message": "Error description here"
  }

  Status Codes:
  - 200 - Success
  - 201 - Created
  - 400 - Bad Request (validation error, invalid data)
  - 401 - Unauthorized (missing or invalid token)
  - 403 - Forbidden (trying to delete others' articles)
  - 404 - Not Found (resource doesn't exist)
  - 409 - Conflict (email already exists)
  - 500 - Internal Server Error

  Logging

  Request and error logs are stored in the logs/ directory:

  - request.log - All HTTP requests (method, URL, status, response time)
  - error.log - All errors with stack traces

  Logs are in JSON format for easy parsing.

  Testing

  Using Postman

  Import the provided Postman collection:
  news-explorer-api-tests.postman_collection.json

  Or test manually:

  # Register a user
  curl -X POST http://localhost:3000/signup \
    -H "Content-Type: application/json" \
    -d '{"email":"test@example.com","password":"password123","username":"TestUser"}'

  # Login
  curl -X POST http://localhost:3000/signin \
    -H "Content-Type: application/json" \
    -d '{"email":"test@example.com","password":"password123"}'

  # Get current user (replace TOKEN with your JWT)
  curl http://localhost:3000/users/me \
    -H "Authorization: Bearer TOKEN"

  Development

  Available Scripts

  - npm start - Start the server
  - npm run dev - Start with nodemon (auto-restart)
  - npm test - Run tests (if configured)

  Code Style

  - ES6+ modern JavaScript
  - Async/await for asynchronous operations
  - Error-first callbacks converted to promises
  - Modular structure with separation of concerns

  Deployment

  Production Checklist

  1. Set NODE_ENV=production in environment
  2. Use strong JWT_SECRET (generate with crypto)
  3. Configure MongoDB Atlas or production database
  4. Set appropriate CORS origins
  5. Configure reverse proxy (nginx) if needed
  6. Enable HTTPS/SSL
  7. Set up monitoring and logging
  8. Configure firewall rules

  Environment Variables for Production

  NODE_ENV=production
  PORT=3000
  DATABASE_URL=mongodb+srv://user:pass@cluster.mongodb.net/news-explorer
  JWT_SECRET=<generated-secret-key>

  Live Deployment

  - **Production API**: https://api.newsexplorer.cdmstr.com
  - **Frontend URL**: https://newsexplorer.cdmstr.com
  - **Platform**: Google Cloud Platform
  - **Process Manager**: PM2
  - **Web Server**: Nginx (reverse proxy)
  - **SSL**: Let's Encrypt (Certbot)

  License

  This project is part of a bootcamp portfolio.

  Acknowledgments

  - Developed as part of the TripleTen Web Development Bootcamp
  - RESTful API design following industry best practices
