import { Router } from 'express';
import { body } from 'express-validator';
import { registerUser, loginUser, getProfile } from '../controllers/authController.js';
import { authenticateToken } from '../middleware/authMiddleware.js';

const router = Router();

/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     summary: Register a new user
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
 *                 description: User's email address
 *               password:
 *                 type: string
 *                 format: password
 *                 minLength: 6
 *                 description: User's password (min 6 characters, with uppercase, lowercase, number, special char)
 *     responses:
 *       201:
 *         description: User registered successfully
 *       400:
 *         description: Invalid input (e.g., invalid email, weak password)
 *       409:
 *         description: Email already in use
 *       500:
 *         description: Server error
 */
router.post(
  '/register',
  [
    body('email').isEmail().withMessage('Please enter a valid email address.').normalizeEmail(),
    body('password')
      .isLength({ min: 6 })
      .withMessage('Password must be at least 6 characters long.')
      .matches(/[A-Z]/)
      .withMessage('Password must contain at least one uppercase letter.')
      .matches(/[a-z]/)
      .withMessage('Password must contain at least one lowercase letter.')
      .matches(/[0-9]/)
      .withMessage('Password must contain at least one number.')
      .matches(/[^A-Za-z0-9]/)
      .withMessage('Password must contain at least one special character.')
  ],
  registerUser
);

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Verify user login via Firebase ID token
 *     description: Expects a Firebase ID token obtained from client-side authentication. Verifies the token and returns user details.
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - idToken
 *             properties:
 *               idToken:
 *                 type: string
 *                 description: Firebase ID token obtained from client-side login
 *     responses:
 *       200:
 *         description: User logged in successfully, returns user details
 *       400:
 *         description: ID token is missing
 *       403:
 *         description: Invalid or expired ID token
 *       500:
 *         description: Server error
 */
router.post(
  '/login',
  [
    body('idToken').notEmpty().withMessage('ID token is required.')
  ],
  loginUser
);

/**
 * @swagger
 * /api/auth/profile:
 *   get:
 *     summary: Retrieve authenticated user's profile
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User profile retrieved successfully
 *       401:
 *         description: No authentication token provided
 *       403:
 *         description: Invalid or expired authentication token
 *       404:
 *         description: User not found
 *       500:
 *         description: Server error
 */
router.get('/profile', authenticateToken, getProfile);

export default router;
