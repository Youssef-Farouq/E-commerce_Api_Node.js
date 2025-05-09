# Task Management API

A robust RESTful API for task management built with Node.js, Express, and Prisma.

## Features

* 🔐 **Authentication & Authorization**  
   * JWT-based authentication  
   * Refresh token mechanism  
   * Secure password requirements  
   * User profile management

* 📋 **Task Management**  
   * Create, read, update, and delete tasks
   * Task status tracking
   * Task categorization
   * Task assignment to users

* 🛡️ **Security**  
   * Password hashing with bcrypt  
   * JWT token encryption  
   * Rate limiting  
   * CORS protection  
   * Helmet security headers  
   * Input validation  
   * SQL injection prevention

* 📚 **API Documentation**  
   * Swagger/OpenAPI documentation  
   * Interactive API testing interface  
   * Detailed request/response schemas

## Prerequisites

* Node.js (v14 or higher)
* npm or yarn
* SQLite (for development)

## Installation

1. Clone the repository:  
```bash
git clone https://github.com/Youssef-Farouq/Task_Management_API_Node.js.git
cd Task_Management_API_Node.js
```

2. Install dependencies:  
```bash
npm install
```

3. Set up environment variables:  
Create a `.env` file in the root directory with the following variables:
```env
# Database
DATABASE_URL="file:./dev.db"

# JWT
JWT_SECRET="your-super-secret-jwt-key-change-in-production"
JWT_REFRESH_SECRET="your-super-secret-refresh-key-change-in-production"
JWT_EXPIRES_IN="1h"
JWT_REFRESH_EXPIRES_IN="7d"

# Server
PORT=3000
NODE_ENV="development"

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000  # 15 minutes
RATE_LIMIT_MAX=100  # 100 requests per window
AUTH_RATE_LIMIT_MAX=5  # 5 requests per window for auth endpoints
```

4. Initialize the database:  
```bash
npx prisma generate
npx prisma db push
```

5. Start the server:  
```bash
# Development mode with auto-reload
npm run dev

# Production mode
npm start
```

## API Endpoints

### Authentication

#### Public Endpoints

* `POST /api/auth/register` - Register a new user
* `POST /api/auth/login` - Login and get JWT token
* `POST /api/auth/refresh-token` - Refresh JWT token
* `POST /api/auth/forgot-password` - Request password reset
* `POST /api/auth/reset-password` - Reset password with token

#### Protected Endpoints

* `GET /api/auth/profile` - Get current user's profile
* `PUT /api/auth/profile` - Update user's profile
* `POST /api/auth/change-password` - Change user's password

### Task Management

#### Protected Endpoints

* `GET /api/tasks` - Get list of tasks
* `POST /api/tasks` - Create a new task
* `GET /api/tasks/:id` - Get task details
* `PUT /api/tasks/:id` - Update a task
* `DELETE /api/tasks/:id` - Delete a task

## Project Structure

```
src/
├── config/         # Configuration files
├── controllers/    # Route controllers
├── middleware/     # Custom middleware
├── prisma/         # Database schema and migrations
├── routes/         # API routes
├── app.js         # Express app setup
└── server.js      # Server entry point
```

## Database Schema

The project uses Prisma with the following main models:

* User
* Task
* RefreshToken

## Security Features

### Password Requirements

* Minimum 8 characters
* At least one uppercase letter
* At least one lowercase letter
* At least one number
* At least one special character

### Rate Limiting

* API endpoints: 100 requests per 15 minutes
* Auth endpoints: 5 requests per 15 minutes

## Error Handling

The API uses a consistent error response format:

```json
{
  "success": false,
  "message": "Error message",
  "errors": [
    {
      "field": "fieldName",
      "message": "Validation error message"
    }
  ]
}
```

## API Documentation

Access the interactive API documentation at:

```
http://localhost:3000/api-docs
```

## Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License

This project is licensed under the MIT License. 