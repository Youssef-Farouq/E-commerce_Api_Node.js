const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const config = require('../config/config');
const { validate, schemas } = require('../middleware/validationMiddleware');

const prisma = new PrismaClient();

/**
 * @swagger
 * components:
 *   schemas:
 *     UserDto:
 *       type: object
 *       required:
 *         - username
 *         - email
 *         - password
 *       properties:
 *         username:
 *           type: string
 *           description: The username
 *           example: Youssef
 *         email:
 *           type: string
 *           format: email
 *           description: The email address
 *           example: youssef@hotmail.com
 *         password:
 *           type: string
 *           format: password
 *           description: The password
 *           example: Youssef123!
 *     LoginDto:
 *       type: object
 *       required:
 *         - username
 *         - password
 *       properties:
 *         username:
 *           type: string
 *           description: The username
 *           example: Youssef
 *         password:
 *           type: string
 *           format: password
 *           description: The password
 *           example: Youssef123!
 *     AuthResponse:
 *       type: object
 *       properties:
 *         token:
 *           type: string
 *           description: JWT token
 *         refreshToken:
 *           type: string
 *           description: Refresh token
 *         expiresIn:
 *           type: integer
 *           description: Token expiration time in seconds
 */

const generateTokens = async (user) => {
    // Generate access token (15 minutes)
    const accessToken = jwt.sign(
        { 
            id: user.id,
            username: user.username,
            email: user.email,
            role: user.role
        },
        config.jwt.key,
        {
            expiresIn: '15m',
            issuer: config.jwt.issuer,
            audience: config.jwt.audience
        }
    );

    // Generate refresh token
    const refreshToken = crypto.randomBytes(40).toString('hex');
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

    // Save refresh token
    await prisma.refreshToken.create({
        data: {
            token: refreshToken,
            expiresAt,
            userId: user.id
        }
    });

    return {
        accessToken,
        refreshToken,
        expiresIn: 15 * 60 // 15 minutes in seconds
    };
};

const authController = {
  /**
   * @swagger
   * /auth/register:
   *   post:
   *     summary: Register a new user
   *     tags: [Auth]
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             $ref: '#/components/schemas/User'
   *     responses:
   *       201:
   *         description: User registered successfully
   *         content:
   *           application/json:
   *             schema:
   *               allOf:
   *                 - $ref: '#/components/schemas/ApiResponse'
   *                 - example:
   *                     success: true
   *                     message: User registered successfully
   *                     data:
   *                       token: "jwt-token"
   *                       user:
   *                         id: 1
   *                         email: "user@example.com"
   *                         firstName: "John"
   *                         lastName: "Doe"
   *                         age: 25
   *                         gender: "male"
   *                         profilePicUrl: "https://example.com/profile.jpg"
   *       400:
   *         description: Invalid input or user already exists
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/ApiResponse'
   *       500:
   *         description: Server error
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/ApiResponse'
   */
  async register(req, res) {
    try {
      const { email, password, firstName, lastName, age, gender, profilePicUrl } = req.body;

      // Validate required fields
      if (!email || !password || !firstName || !lastName || !age || !gender) {
        return res.status(400).json({
          success: false,
          message: 'All fields are required except profilePicUrl'
        });
      }

      // Check if user already exists
      const existingUser = await prisma.user.findUnique({
        where: { email }
      });

      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: 'User already exists'
        });
      }

      // Hash password
      const salt = await bcrypt.genSalt(10);
      const passwordHash = await bcrypt.hash(password, salt);

      // Create user
      const user = await prisma.user.create({
        data: {
          email,
          passwordHash,
          firstName,
          lastName,
          age,
          gender,
          profilePicUrl
        }
      });

      // Generate JWT token
      const token = jwt.sign(
        { userId: user.id },
        process.env.JWT_SECRET,
        { expiresIn: '1h' }
      );

      res.status(201).json({
        success: true,
        message: 'User registered successfully',
        data: {
          token,
          user: {
            id: user.id,
            email: user.email,
            firstName: user.firstName,
            lastName: user.lastName,
            age: user.age,
            gender: user.gender,
            profilePicUrl: user.profilePicUrl
          }
        }
      });
    } catch (error) {
      console.error('Registration error:', error);
      res.status(500).json({
        success: false,
        message: 'Error registering user',
        error: error.message
      });
    }
  },

  /**
   * @swagger
   * /auth/login:
   *   post:
   *     summary: Login and get JWT token
   *     tags: [Auth]
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required:
   *               - email
   *               - password
   *             properties:
   *               email:
   *                 type: string
   *                 format: email
   *                 example: user@example.com
   *               password:
   *                 type: string
   *                 format: password
   *                 example: password123
   *     responses:
   *       200:
   *         description: Login successful
   *         content:
   *           application/json:
   *             schema:
   *               allOf:
   *                 - $ref: '#/components/schemas/ApiResponse'
   *                 - example:
   *                     success: true
   *                     message: Login successful
   *                     data:
   *                       token: "jwt-token"
   *                       user:
   *                         id: 1
   *                         email: "user@example.com"
   *                         firstName: "John"
   *                         lastName: "Doe"
   *                         age: 25
   *                         gender: "male"
   *                         profilePicUrl: "https://example.com/profile.jpg"
   *       401:
   *         description: Invalid credentials
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/ApiResponse'
   *       500:
   *         description: Server error
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/ApiResponse'
   */
  async login(req, res) {
    try {
      const { email, password } = req.body;

      // Validate required fields
      if (!email || !password) {
        return res.status(400).json({
          success: false,
          message: 'Email and password are required'
        });
      }

      // Find user
      const user = await prisma.user.findUnique({
        where: { email }
      });

      if (!user) {
        return res.status(401).json({
          success: false,
          message: 'Invalid credentials'
        });
      }

      // Verify password
      const validPassword = await bcrypt.compare(password, user.passwordHash);
      if (!validPassword) {
        return res.status(401).json({
          success: false,
          message: 'Invalid credentials'
        });
      }

      // Update last login
      await prisma.user.update({
        where: { id: user.id },
        data: { lastLoginAt: new Date() }
      });

      // Generate JWT token
      const token = jwt.sign(
        { userId: user.id },
        process.env.JWT_SECRET,
        { expiresIn: '1h' }
      );

      res.json({
        success: true,
        message: 'Login successful',
        data: {
          token,
          user: {
            id: user.id,
            email: user.email,
            firstName: user.firstName,
            lastName: user.lastName,
            age: user.age,
            gender: user.gender,
            profilePicUrl: user.profilePicUrl
          }
        }
      });
    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({
        success: false,
        message: 'Error logging in',
        error: error.message
      });
    }
  },

  /**
   * @swagger
   * /api/auth/refresh-token:
   *   post:
   *     summary: Refresh JWT token
   *     tags: [Auth]
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required:
   *               - refreshToken
   *             properties:
   *               refreshToken:
   *                 type: string
   *     responses:
   *       200:
   *         description: Token refreshed successfully
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/AuthResponse'
   *       401:
   *         description: Invalid refresh token
   *       500:
   *         description: Server error
   */
  async refreshToken(req, res) {
    try {
      // Validate input
      const { error } = schemas.refreshToken.validate(req.body);
      if (error) {
        return res.status(400).json({ error: error.details[0].message });
      }

      const { refreshToken } = req.body;

      // Find refresh token
      const token = await prisma.refreshToken.findUnique({
        where: { token: refreshToken },
        include: { user: true },
      });

      if (!token || !token.isActive) {
        return res.status(401).json({ error: 'Invalid refresh token' });
      }

      // Generate new tokens
      const tokens = await generateTokens(token.user);

      // Revoke old token
      await prisma.refreshToken.update({
        where: { id: token.id },
        data: {
          revokedAt: new Date(),
          replacedByToken: tokens.refreshToken,
          reasonRevoked: 'Replaced by new token',
        },
      });

      res.json(tokens);
    } catch (error) {
      console.error('Refresh token error:', error);
      res.status(500).json({ error: 'An error occurred while processing your request.' });
    }
  },

  /**
   * @swagger
   * /api/auth/revoke-token:
   *   post:
   *     summary: Revoke refresh token
   *     tags: [Auth]
   *     security:
   *       - bearerAuth: []
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required:
   *               - refreshToken
   *             properties:
   *               refreshToken:
   *                 type: string
   *     responses:
   *       200:
   *         description: Token revoked successfully
   *       401:
   *         description: Unauthorized
   *       404:
   *         description: Refresh token not found
   *       500:
   *         description: Server error
   */
  async revokeToken(req, res) {
    try {
      // Validate input
      const { error } = schemas.refreshToken.validate(req.body);
      if (error) {
        return res.status(400).json({ error: error.details[0].message });
      }

      const { refreshToken } = req.body;

      // Find and revoke token
      const token = await prisma.refreshToken.findUnique({
        where: { token: refreshToken },
      });

      if (!token) {
        return res.status(404).json({ error: 'Refresh token not found' });
      }

      await prisma.refreshToken.update({
        where: { id: token.id },
        data: {
          revokedAt: new Date(),
          reasonRevoked: 'Revoked by user',
        },
      });

      res.json({ message: 'Token revoked successfully' });
    } catch (error) {
      console.error('Revoke token error:', error);
      res.status(500).json({ error: 'An error occurred while processing your request.' });
    }
  },
};

module.exports = authController; 