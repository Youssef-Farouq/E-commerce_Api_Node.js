# Task Management API

A robust RESTful API for task management built with Node.js, Express, and Prisma.

## Features

- 🔐 **Authentication & Authorization**
  - JWT-based authentication
  - Refresh token mechanism
  - Password reset functionality
  - Secure password requirements
  - User profile management

- 📋 **Task Management**
  - Create, read, update, and delete tasks
  - Task status tracking
  - Task priority levels
  - Task categories
  - Task assignment to users
  - Task due dates and reminders

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
   git clone https://github.com/Youssef-Farouq/Task_Management_API_Node.js.git
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
   npx prisma db push
   ```

5. Start the server:
   ```bash
   # Development mode
   npm run dev

   # Production mode
   npm start
   ```

## Project Structure

```
src/
├── config/         # Configuration files
├── controllers/    # Route controllers
├── middleware/     # Custom middleware
├── prisma/         # Database schema and migrations
├── routes/         # API routes
├── app.js         # Express app setup
├── server.js      # Server entry point
└── swagger.js     # API documentation setup
```

## API Endpoints

### Authentication

#### Public Endpoints
- `POST /api/auth/register` - Register a new user
  ```json
  {
    "email": "user@example.com",
    "password": "SecurePass123!",
    "firstName": "John",
    "lastName": "Doe"
  }
  ```

- `POST /api/auth/login` - Login and get JWT token
  ```json
  {
    "email": "user@example.com",
    "password": "SecurePass123!"
  }
  ```

- `POST /api/auth/refresh-token` - Refresh JWT token
  ```json
  {
    "refreshToken": "your-refresh-token"
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
        "email": "user@example.com",
        "firstName": "John",
        "lastName": "Doe",
        "createdAt": "2024-03-15T10:00:00Z",
        "lastLoginAt": "2024-03-15T15:30:00Z"
      }
    }
    ```

### Task Management

#### Protected Endpoints
- `GET /api/tasks` - Get list of tasks
  - Query Parameters:
    - `page`: Page number (default: 1)
    - `limit`: Tasks per page (default: 10)
    - `status`: Filter by status
    - `priority`: Filter by priority
    - `category`: Filter by category

- `POST /api/tasks` - Create a new task
  ```json
  {
    "title": "Complete project documentation",
    "description": "Write comprehensive API documentation",
    "priority": "HIGH",
    "category": "Documentation",
    "dueDate": "2024-03-20T00:00:00Z"
  }
  ```

- `GET /api/tasks/:id` - Get task details
- `PUT /api/tasks/:id` - Update task
- `DELETE /api/tasks/:id` - Delete task

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

## API Documentation

Access the interactive API documentation at:
```
http://localhost:3000/api-docs
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License. 