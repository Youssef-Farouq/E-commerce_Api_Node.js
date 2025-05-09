# Task Management API

A robust RESTful API for task management built with Node.js, Express, and Prisma.

## Features

- 🔐 **Authentication & Authorization**
  - JWT-based authentication
  - Refresh token mechanism
  - Password reset functionality
  - Secure password requirements
  - User profile management with profile pictures

- 📋 **Task Management**
  - Create, read, update, and delete tasks
  - Assign tasks to users
  - Filter tasks by status, priority, and due date
  - Task comments and attachments
  - Task history and audit logs

- 🛡️ **Security**
  - Password hashing with bcrypt
  - JWT token encryption
  - Rate limiting
  - CORS protection
  - Helmet security headers
  - Input validation
  - SQL injection prevention

- 📚 **API Documentation**
  - Swagger/OpenAPI documentation
  - Interactive API testing interface
  - Detailed request/response schemas

## Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- SQLite (for development) or PostgreSQL (for production)

## Installation

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd task-management-api
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   ```bash
   cp .env.example .env
   ```
   Update the `.env` file with your configuration:
   ```
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
   npx prisma migrate dev
   ```

5. Start the server:
   ```bash
   npm start
   ```

## API Endpoints

### Authentication

#### Public Endpoints
- `POST /api/auth/register` - Register a new user
  ```json
  {
    "email": "youssef@outlook.com",
    "password": "Youssef123!",
    "firstName": "Youssef",
    "lastName": "Farouq",
    "age": 24,
    "gender": "male"
  }
  ```

- `POST /api/auth/login` - Login and get JWT token
  ```json
  {
    "email": "youssef@outlook.com",
    "password": "Youssef123!"
  }
  ```

- `POST /api/auth/refresh-token` - Refresh JWT token
  ```json
  {
    "refreshToken": "your-refresh-token"
  }
  ```

- `POST /api/auth/forgot-password` - Request password reset
  ```json
  {
    "email": "user@example.com"
  }
  ```

- `POST /api/auth/reset-password` - Reset password with token
  ```json
  {
    "token": "reset-token",
    "newPassword": "NewSecurePass123!"
  }
  ```

#### Protected Endpoints
- `GET /api/auth/profile` - Get current user's profile
  - Response:
    ```json
    {
      "success": true,
      "data": {
        "id": 1,
        "email": "youssef@outlook.com",
        "firstName": "Youssef",
        "lastName": "Farouq",
        "age": 24,
        "gender": "male",
        "createdAt": "2024-03-15T10:00:00Z",
        "lastLoginAt": "2024-03-15T15:30:00Z"
      }
    }
    ```

- `POST /api/auth/change-password` - Change user's password
  ```json
  {
    "currentPassword": "CurrentPass123!",
    "newPassword": "NewSecurePass123!"
  }
  ```

### Task Management

#### Public Endpoints
- `GET /api/tasks` - Get list of tasks
  - Query Parameters:
    - `page`: Page number (default: 1)
    - `limit`: Tasks per page (default: 10)
  - Response:
    ```json
    {
      "tasks": [
        {
          "id": 1,
          "title": "Complete project",
          "status": "In Progress",
          "priority": "High",
          "dueDate": "2024-03-20T00:00:00Z",
          "assignedTo": "Youssef Farouq"
        }
      ],
      "pagination": {
        "total": 100,
        "page": 1,
        "limit": 10,
        "totalPages": 10
      }
    }
    ```

- `GET /api/tasks/:id` - Get detailed task information
  - Response:
    ```json
    {
      "id": 1,
      "title": "Complete project",
      "description": "Finish the task management API",
      "status": "In Progress",
      "priority": "High",
      "dueDate": "2024-03-20T00:00:00Z",
      "assignedTo": "Youssef Farouq",
      "comments": [
        {
          "id": 1,
          "text": "Working on it",
          "author": "Youssef Farouq",
          "createdAt": "2024-03-15T16:00:00Z"
        }
      ]
    }
    ```

#### Protected Endpoints
- `POST /api/tasks` - Create a new task
  - Request:
    ```json
    {
      "title": "New Task",
      "description": "Task description",
      "status": "To Do",
      "priority": "Medium",
      "dueDate": "2024-03-25T00:00:00Z",
      "assignedTo": "user@example.com"
    }
    ```
- `PUT /api/tasks/:id` - Update a task
  - Request:
    ```json
    {
      "title": "Updated Task",
      "description": "Updated description",
      "status": "In Progress",
      "priority": "High",
      "dueDate": "2024-03-30T00:00:00Z",
      "assignedTo": "user@example.com"
    }
    ```
- `DELETE /api/tasks/:id` - Delete a task

## Security Features

### Password Requirements
- Minimum 8 characters
- At least one uppercase letter
- At least one lowercase letter
- At least one number
- At least one special character

### Rate Limiting
- API endpoints: 100 requests per 15 minutes
- Auth endpoints: 5 requests per 15 minutes

### CORS Configuration
- Configurable allowed origins
- Secure headers with Helmet
- Request size limits

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

## Development

### Project Structure
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

### Database Schema
The project uses Prisma with the following main models:
- User
- Task
- RefreshToken

## Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License

This project is licensed under the MIT License.

## About

No description, website, or topics provided.

### Resources

Readme 

Activity 

### Stars

**0** stars 

### Watchers

**1** watching 

### Forks

**0** forks 

Report repository 

## Releases

No releases published

## Packages0

No packages published   

## Languages

* JavaScript 100.0%

## Footer

© 2025 GitHub, Inc. 

### Footer navigation

* Terms
* Privacy
* Security
* Status
* Docs
* Contact
* Manage cookies
* Do not share my personal information 