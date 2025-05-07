require('dotenv').config();

module.exports = {
  database: {
    url: process.env.DATABASE_URL || 'file:./dev.db',
  },
  jwt: {
    key: process.env.JWT_SECRET || 'your-secret-key',
    issuer: process.env.JWT_ISSUER || 'task-manager-api',
    audience: process.env.JWT_AUDIENCE || 'task-manager-client',
    expiryInMinutes: parseInt(process.env.JWT_EXPIRY_IN_MINUTES, 10),
  },
}; 