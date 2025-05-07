# Node.js Task Manager API

A robust RESTful API for task management built with Node.js, Express, and Prisma.

## Features

- User authentication with JWT
- Task management (CRUD operations)
- Rate limiting
- Swagger API documentation
- Refresh token mechanism
- SQLite database with Prisma ORM

## Prerequisites

- Node.js (v14 or higher)
- npm (v6 or higher)

## Setup

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```

3. Initialize the database:
   ```bash
   npx prisma generate
   npx prisma db push
   ```

4. Create a `.env` file in the root directory with the following variables:
   ```
   # Database
   DATABASE_URL="file:./dev.db"

   # JWT
   JWT_SECRET="your-super-secret-key-change-this-in-production"
   JWT_ISSUER="task-manager-api"
   JWT_AUDIENCE="task-manager-client"
   JWT_EXPIRY_IN_MINUTES=15

   # Server
   PORT=3000
   NODE_ENV=development
   ```

## Running the Application

Development mode:
```bash
npm run dev
```

Production mode:
```bash
npm start
```

The server will start on http://localhost:3000

## API Documentation

Swagger documentation is available at: http://localhost:3000/api-docs

## API Endpoints

### Authentication
- POST `/api/auth/register` - Register a new user
- POST `/api/auth/login` - Login user
- POST `/api/auth/refresh-token` - Refresh authentication token
- POST `/api/auth/revoke-token` - Revoke authentication token (protected)

### Tasks
- POST `/api/tasks` - Create a new task (protected)
- GET `/api/tasks` - Get all tasks (protected)
- GET `/api/tasks/:id` - Get task by ID (protected)
- PUT `/api/tasks/:id` - Update task (protected)
- DELETE `/api/tasks/:id` - Delete task (protected)

## Testing the API

1. Register a new user:
```bash
curl -X POST http://localhost:3000/api/auth/register \
-H "Content-Type: application/json" \
-d '{
    "username": "Youssef",
    "email": "youssef@hotmail.com",
    "password": "Youssef123!"
}'
```

2. Login to get JWT token:
```bash
curl -X POST http://localhost:3000/api/auth/login \
-H "Content-Type: application/json" \
-d '{
    "username": "Youssef",
    "password": "Youssef123!"
}'
```

3. Use the JWT token for protected endpoints:
```bash
curl -X POST http://localhost:3000/api/tasks \
-H "Content-Type: application/json" \
-H "Authorization: Bearer YOUR_JWT_TOKEN" \
-d '{
    "title": "My first task",
    "description": "This is a test task",
    "status": "Pending"
}'
```

## Error Handling

The API uses a global exception handler that returns errors in the following format:
```json
{
    "error": "Error message"
}
```

## Security Features

- JWT-based authentication
- Password hashing with bcrypt
- Rate limiting
- CORS protection
- Refresh token rotation
- Token revocation
- Input validation
- SQL injection protection (via Prisma)
- XSS protection (via Helmet)
- HTTPS redirection in production 