const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const config = require('../config/config');
const { validate, schemas } = require('../middleware/validationMiddleware');

const prisma = new PrismaClient();

// Password validation function
const validatePassword = (password) => {
    const minLength = 8;
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumbers = /\d/.test(password);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);

    const errors = [];
    if (password.length < minLength) {
        errors.push(`Password must be at least ${minLength} characters long`);
    }
    if (!hasUpperCase) {
        errors.push('Password must contain at least one uppercase letter');
    }
    if (!hasLowerCase) {
        errors.push('Password must contain at least one lowercase letter');
    }
    if (!hasNumbers) {
        errors.push('Password must contain at least one number');
    }
    if (!hasSpecialChar) {
        errors.push('Password must contain at least one special character');
    }

    return {
        isValid: errors.length === 0,
        errors
    };
};

/**
 * @swagger
 * components:
 *   schemas:
 *     UserDto:
 *       type: object
 *       required:
 *         - email
 *         - password
 *         - firstName
 *         - lastName
 *         - age
 *         - gender
 *       properties:
 *         email:
 *           type: string
 *           format: email
 *           description: The email address
 *           example: youssef@outlook.com
 *         password:
 *           type: string
 *           format: password
 *           description: |
 *             The password must meet the following requirements:
 *             - At least 8 characters long
 *             - Contains at least one uppercase letter
 *             - Contains at least one lowercase letter
 *             - Contains at least one number
 *             - Contains at least one special character (!@#$%^&*(),.?":{}|<>)
 *           example: Youssef123!
 *         firstName:
 *           type: string
 *           description: User's first name
 *           example: Youssef
 *         lastName:
 *           type: string
 *           description: User's last name
 *           example: Farouq
 *         age:
 *           type: integer
 *           description: User's age
 *           example: 24
 *         gender:
 *           type: string
 *           enum: [male, female, other]
 *           description: User's gender
 *           example: male
 *         profilePicUrl:
 *           type: string
 *           format: uri
 *           description: URL to user's profile picture
 *           example: https://example.com/profile.jpg
 *     LoginDto:
 *       type: object
 *       required:
 *         - email
 *         - password
 *       properties:
 *         email:
 *           type: string
 *           format: email
 *           description: The email address
 *           example: youssef@outlook.com
 *         password:
 *           type: string
 *           format: password
 *           description: The user's password
 *           example: Youssef123!
 *     AuthResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           description: Whether the operation was successful
 *           example: true
 *         message:
 *           type: string
 *           description: Response message
 *           example: Login successful
 *         data:
 *           type: object
 *           properties:
 *             accessToken:
 *               type: string
 *               description: JWT access token
 *               example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
 *             refreshToken:
 *               type: string
 *               description: Refresh token
 *               example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
 *             expiresIn:
 *               type: integer
 *               description: Token expiration time in seconds
 *               example: 900
 *             user:
 *               type: object
 *               properties:
 *                 id:
 *                   type: integer
 *                   example: 1
 *                 email:
 *                   type: string
 *                   example: youssef@outlook.com
 *                 firstName:
 *                   type: string
 *                   example: Youssef
 *                 lastName:
 *                   type: string
 *                   example: Farouq
 *                 age:
 *                   type: integer
 *                   example: 24
 *                 gender:
 *                   type: string
 *                   example: male
 *                 profilePicUrl:
 *                   type: string
 *                   example: https://example.com/profile.jpg
 */

const generateTokens = async (user) => {
    try {
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
                expiresIn: config.jwt.accessTokenExpiry,
                issuer: config.jwt.issuer,
                audience: config.jwt.audience
            }
        );

        // Generate refresh token
        const refreshToken = crypto.randomBytes(40).toString('hex');
        const expiresAt = new Date(Date.now() + config.jwt.refreshTokenExpiry * 1000);

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
            expiresIn: config.jwt.accessTokenExpiry
        };
    } catch (error) {
        console.error('Token generation error:', error);
        throw new Error('Failed to generate tokens');
    }
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
   *             $ref: '#/components/schemas/UserDto'
   *           example:
   *             email: youssef@outlook.com
   *             password: Youssef123!
   *             firstName: Youssef
   *             lastName: Farouq
   *             age: 24
   *             gender: male
   *     responses:
   *       201:
   *         description: User registered successfully
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/AuthResponse'
   *             example:
   *               success: true
   *               message: User registered successfully
   *               data:
   *                 accessToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
   *                 refreshToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
   *                 expiresIn: 900
   *                 user:
   *                   id: 1
   *                   email: youssef@outlook.com
   *                   firstName: Youssef
   *                   lastName: Farouq
   *                   age: 24
   *                   gender: male
   *                   profilePicUrl: https://example.com/profile.jpg
   *       400:
   *         description: Invalid input or user already exists
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/AuthResponse'
   *       500:
   *         description: Server error
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/AuthResponse'
   */
  async register(req, res) {
    try {
      // Validate input using schema
      const { error } = schemas.register.validate(req.body);
      if (error) {
        return res.status(400).json({
          success: false,
          message: error.details[0].message
        });
      }

      const { email, password, firstName, lastName, age, gender, profilePicUrl } = req.body;

      // Validate password strength
      const passwordValidation = validatePassword(password);
      if (!passwordValidation.isValid) {
        return res.status(400).json({
          success: false,
          message: 'Password validation failed',
          errors: passwordValidation.errors
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

      // Generate tokens
      const tokens = await generateTokens(user);

      res.status(201).json({
        success: true,
        message: 'User registered successfully',
        data: {
          ...tokens,
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
   *             $ref: '#/components/schemas/LoginDto'
   *           example:
   *             email: youssef@outlook.com
   *             password: Youssef123!
   *     responses:
   *       200:
   *         description: Login successful
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/AuthResponse'
   *             example:
   *               success: true
   *               message: Login successful
   *               data:
   *                 accessToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
   *                 refreshToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
   *                 expiresIn: 900
   *                 user:
   *                   id: 1
   *                   email: youssef@outlook.com
   *                   firstName: Youssef
   *                   lastName: Farouq
   *                   age: 24
   *                   gender: male
   *                   profilePicUrl: https://example.com/profile.jpg
   *       401:
   *         description: Invalid credentials
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/AuthResponse'
   *       500:
   *         description: Server error
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/AuthResponse'
   */
  async login(req, res) {
    try {
      // Validate input using schema
      const { error } = schemas.login.validate(req.body);
      if (error) {
        return res.status(400).json({
          success: false,
          message: error.details[0].message
        });
      }

      const { email, password } = req.body;

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

      // Generate tokens
      const tokens = await generateTokens(user);

      res.json({
        success: true,
        message: 'Login successful',
        data: {
          ...tokens,
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
   * /auth/refresh-token:
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
   *                 description: The refresh token
   *                 example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
   *     responses:
   *       200:
   *         description: Token refreshed successfully
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/AuthResponse'
   *       401:
   *         description: Invalid refresh token
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/AuthResponse'
   *       500:
   *         description: Server error
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/AuthResponse'
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
   * /auth/revoke-token:
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
   *                 description: The refresh token to revoke
   *                 example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
   *     responses:
   *       200:
   *         description: Token revoked successfully
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 success:
   *                   type: boolean
   *                   example: true
   *                 message:
   *                   type: string
   *                   example: Token revoked successfully
   *       401:
   *         description: Unauthorized
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/AuthResponse'
   *       404:
   *         description: Refresh token not found
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/AuthResponse'
   *       500:
   *         description: Server error
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/AuthResponse'
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

  /**
   * @swagger
   * /auth/profile:
   *   get:
   *     summary: Get current user's profile
   *     tags: [Auth]
   *     security:
   *       - bearerAuth: []
   *     responses:
   *       200:
   *         description: User profile retrieved successfully
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 success:
   *                   type: boolean
   *                   example: true
   *                 data:
   *                   type: object
   *                   properties:
   *                     id:
   *                       type: integer
   *                       example: 1
   *                     email:
   *                       type: string
   *                       example: youssef@outlook.com
   *                     firstName:
   *                       type: string
   *                       example: Youssef
   *                     lastName:
   *                       type: string
   *                       example: Farouq
   *                     age:
   *                       type: integer
   *                       example: 24
   *                     gender:
   *                       type: string
   *                       example: male
   *                     profilePicUrl:
   *                       type: string
   *                       example: https://example.com/profile.jpg
   *       401:
   *         description: Unauthorized
   */
  async getProfile(req, res) {
    try {
      const userId = req.user.id;
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          age: true,
          gender: true,
          profilePicUrl: true,
          createdAt: true,
          lastLoginAt: true
        }
      });

      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }

      res.json({
        success: true,
        data: user
      });
    } catch (error) {
      console.error('Get profile error:', error);
      res.status(500).json({
        success: false,
        message: 'Error retrieving profile',
        error: error.message
      });
    }
  },

  /**
   * @swagger
   * /auth/forgot-password:
   *   post:
   *     summary: Request password reset
   *     tags: [Auth]
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required:
   *               - email
   *             properties:
   *               email:
   *                 type: string
   *                 format: email
   *                 example: youssef@outlook.com
   *     responses:
   *       200:
   *         description: Password reset email sent
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 success:
   *                   type: boolean
   *                   example: true
   *                 message:
   *                   type: string
   *                   example: Password reset instructions sent to your email
   */
  async forgotPassword(req, res) {
    try {
      const { email } = req.body;
      const user = await prisma.user.findUnique({
        where: { email }
      });

      if (!user) {
        // Return success even if user doesn't exist for security
        return res.json({
          success: true,
          message: 'If an account exists with this email, you will receive password reset instructions'
        });
      }

      // Generate reset token
      const resetToken = crypto.randomBytes(32).toString('hex');
      const resetTokenExpiry = new Date(Date.now() + 3600000); // 1 hour

      // Save reset token to database
      await prisma.user.update({
        where: { id: user.id },
        data: {
          resetToken,
          resetTokenExpiry
        }
      });

      // TODO: Send email with reset link
      // For now, just return the token (in production, send via email)
      res.json({
        success: true,
        message: 'Password reset instructions sent to your email',
        // Remove this in production
        resetToken
      });
    } catch (error) {
      console.error('Forgot password error:', error);
      res.status(500).json({
        success: false,
        message: 'Error processing password reset request',
        error: error.message
      });
    }
  },

  /**
   * @swagger
   * /auth/reset-password:
   *   post:
   *     summary: Reset password with token
   *     tags: [Auth]
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required:
   *               - token
   *               - newPassword
   *             properties:
   *               token:
   *                 type: string
   *                 example: "reset-token-here"
   *               newPassword:
   *                 type: string
   *                 format: password
   *                 example: "NewPassword123!"
   *     responses:
   *       200:
   *         description: Password reset successful
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 success:
   *                   type: boolean
   *                   example: true
   *                 message:
   *                   type: string
   *                   example: Password has been reset successfully
   */
  async resetPassword(req, res) {
    try {
      const { token, newPassword } = req.body;

      // Validate password
      const passwordValidation = validatePassword(newPassword);
      if (!passwordValidation.isValid) {
        return res.status(400).json({
          success: false,
          message: 'Password validation failed',
          errors: passwordValidation.errors
        });
      }

      // Find user with valid reset token
      const user = await prisma.user.findFirst({
        where: {
          resetToken: token,
          resetTokenExpiry: {
            gt: new Date()
          }
        }
      });

      if (!user) {
        return res.status(400).json({
          success: false,
          message: 'Invalid or expired reset token'
        });
      }

      // Hash new password
      const salt = await bcrypt.genSalt(10);
      const passwordHash = await bcrypt.hash(newPassword, salt);

      // Update user's password and clear reset token
      await prisma.user.update({
        where: { id: user.id },
        data: {
          passwordHash,
          resetToken: null,
          resetTokenExpiry: null
        }
      });

      res.json({
        success: true,
        message: 'Password has been reset successfully'
      });
    } catch (error) {
      console.error('Reset password error:', error);
      res.status(500).json({
        success: false,
        message: 'Error resetting password',
        error: error.message
      });
    }
  }
};

module.exports = authController; 