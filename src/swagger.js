const swaggerJsdoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'E-commerce API',
      version: '1.0.0',
      description: 'API documentation for the E-commerce application',
    },
    servers: [
      {
        url: 'http://localhost:3000/api',
        description: 'Development server',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
      schemas: {
        User: {
          type: 'object',
          required: ['email', 'password', 'firstName', 'lastName', 'age', 'gender'],
          properties: {
            email: {
              type: 'string',
              format: 'email',
              example: 'youssef@outlook.com',
            },
            password: {
              type: 'string',
              format: 'password',
              example: 'Youssef123!',
            },
            firstName: {
              type: 'string',
              example: 'Youssef',
            },
            lastName: {
              type: 'string',
              example: 'Farouq',
            },
            age: {
              type: 'integer',
              example: 24,
            },
            gender: {
              type: 'string',
              example: 'male',
            }
          },
        },
        Item: {
          type: 'object',
          required: ['name', 'category', 'description', 'cost', 'thumbnailUrl', 'imageUrl'],
          properties: {
            name: {
              type: 'string',
              example: 'Classic T-Shirt',
            },
            category: {
              type: 'string',
              example: 'Clothing',
            },
            description: {
              type: 'string',
              example: 'A comfortable cotton t-shirt',
            },
            cost: {
              type: 'number',
              example: 29.99,
            },
            thumbnailUrl: {
              type: 'string',
              example: 'https://example.com/thumbnail.jpg',
            },
            imageUrl: {
              type: 'string',
              example: 'https://example.com/image.jpg',
            },
            size: {
              type: 'string',
              example: 'M',
            },
            color: {
              type: 'string',
              example: 'Blue',
            },
          },
        },
        ApiResponse: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              example: true,
            },
            message: {
              type: 'string',
              example: 'Operation successful',
            },
            data: {
              type: 'object',
            },
            error: {
              type: 'string',
              example: 'Error message',
            },
          },
        },
      },
    },
  },
  apis: ['./src/controllers/*.js'], // Path to the API docs
};

const specs = swaggerJsdoc(options);

module.exports = specs; 