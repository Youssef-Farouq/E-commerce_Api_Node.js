# Task Management API

A robust RESTful API for task management built with Node.js, Express, and Prisma.

## Features

- 🔐 **Authentication & Authorization**
  - JWT-based authentication
  - Refresh token mechanism
  - Password reset functionality
  - Role-based access control
  - Secure password requirements

- 📝 **Task Management**
  - Create, read, update, and delete tasks
  - Task status tracking
  - Task filtering and search
  - User-specific task lists

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
   cd Task_Management_API_Node.js
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   ```bash
   cp .env.example .env
   ```
   Update the `.env` file with your configuration.

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
- `POST /api/auth/change-password` - Change user's password
  ```json
  {
    "currentPassword": "CurrentPass123!",
    "newPassword": "NewSecurePass123!"
  }
  ```

### Task Management

#### Protected Endpoints
- `GET /api/tasks` - Get all tasks
  - Query Parameters:
    - `status`: Filter by status (pending/in_progress/completed)
    - `search`: Search in title and description

- `GET /api/tasks/:id` - Get specific task

- `POST /api/tasks` - Create new task
  ```json
  {
    "title": "Complete project",
    "description": "Finish the task management API",
    "status": "pending"
  }
  ```

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
├── models/         # Database models
├── routes/         # API routes
├── utils/          # Utility functions
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