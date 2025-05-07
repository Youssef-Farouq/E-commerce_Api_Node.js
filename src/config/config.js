require('dotenv').config();

module.exports = {
  database: {
    url: process.env.DATABASE_URL || 'postgresql://localhost:5432/task_management_db',
  },
  jwt: {
    key: process.env.JWT_SECRET || 'your-secret-key',
    issuer: process.env.JWT_ISSUER || 'task-manager-api',
    audience: process.env.JWT_AUDIENCE || 'task-manager-client',
    accessTokenExpiry: process.env.JWT_ACCESS_TOKEN_EXPIRY || '15m',
    refreshTokenExpiry: parseInt(process.env.JWT_REFRESH_TOKEN_EXPIRY, 10) || 604800, // 7 days in seconds
  },
  server: {
    port: process.env.PORT || 3000,
    env: process.env.NODE_ENV || 'development',
  },
  cors: {
    origin: process.env.CORS_ORIGIN || '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  },
  rateLimit: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100 // limit each IP to 100 requests per windowMs
  }
}; 