import { Router } from 'express';
import { registerUser, loginUser } from '../controllers/userController.js';
import { validateRegister, validateLogin } from '../middleware/validationMiddleware.js';

const router = Router();

/**
 * @route POST /api/v1/users/register
 * @desc Register a new user
 * @access Public
 */
router.post('/register', validateRegister, registerUser);

/**
 * @route POST /api/v1/users/login
 * @desc Authenticate user & get token
 * @access Public
 */
router.post('/login', validateLogin, loginUser);

export default router;
