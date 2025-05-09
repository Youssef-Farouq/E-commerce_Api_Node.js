# E-commerce API

A robust RESTful API for e-commerce built with Node.js, Express, and Prisma.

## Features

- 🔐 **Authentication & Authorization**
  - JWT-based authentication
  - Refresh token mechanism
  - Password reset functionality
  - Secure password requirements
  - User profile management with profile pictures

- 🛍️ **Item Management**
  - List items with pagination
  - Get detailed item information
  - AI-powered item search and comparison
  - Category-based filtering
  - Item attributes (size, color, etc.)

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
   cd e-commerce-api
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

### Item Management

#### Public Endpoints
- `GET /api/items` - Get list of items
  - Query Parameters:
    - `page`: Page number (default: 1)
    - `limit`: Items per page (default: 10)
  - Response:
    ```json
    {
      "items": [
        {
          "id": 1,
          "name": "Classic White T-Shirt",
          "category": "Clothing",
          "cost": 19.99,
          "thumbnailUrl": "https://example.com/thumbnail.jpg"
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

- `GET /api/items/:id` - Get detailed item information
  - Response:
    ```json
    {
      "id": 1,
      "name": "Classic White T-Shirt",
      "category": "Clothing",
      "description": "A comfortable cotton t-shirt",
      "cost": 19.99,
      "thumbnailUrl": "https://example.com/thumbnail.jpg",
      "imageUrl": "https://example.com/image.jpg",
      "size": "M",
      "color": "White",
      "stock": 100,
      "isAvailable": true,
      "attributes": {
        "material": "Cotton",
        "brand": "FashionCo",
        "care": "Machine wash cold"
      }
    }
    ```

#### Protected Endpoints
- `POST /api/items/search` - AI-powered item search
  - Request:
    ```json
    {
      "query": "Find white cotton t-shirts under $30",
      "filters": {
        "minPrice": 0,
        "maxPrice": 30,
        "color": "White",
        "category": "Clothing"
      }
    }
    ```
  - Response:
    ```json
    {
      "results": [
        {
          "id": 1,
          "name": "Classic White T-Shirt",
          "category": "Clothing",
          "description": "A comfortable cotton t-shirt",
          "cost": 19.99,
          "thumbnailUrl": "https://example.com/thumbnail.jpg",
          "imageUrl": "https://example.com/image.jpg",
          "size": "M",
          "color": "White",
          "relevanceScore": 0.95
        }
      ],
      "totalItems": 1
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
├── prisma/         # Database schema and migrations
├── routes/         # API routes
├── services/       # Business logic
├── utils/          # Utility functions
├── app.js         # Express app setup
└── server.js      # Server entry point
```

### Database Schema
The project uses Prisma with the following main models:
- User
- Item
- RefreshToken

## Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License

This project is licensed under the MIT License. 
