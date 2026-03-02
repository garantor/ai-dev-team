import { auth } from '../config/firebase.js';

/**
 * Middleware to authenticate Firebase ID tokens from the Authorization header.
 * Attaches the decoded token to `req.user` if valid.
 */
const authenticateToken = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'No token provided, authorization denied.' });
  }

  const idToken = authHeader.split(' ')[1];

  try {
    const decodedToken = await auth.verifyIdToken(idToken);
    req.user = decodedToken; // decodedToken contains uid, email, etc.
    next();
  } catch (error) {
    console.error('Error verifying Firebase ID token:', error.code, error.message);
    // Specific error messages for common Firebase Auth errors
    let message = 'Invalid or expired token, authorization denied.';
    if (error.code === 'auth/id-token-expired') {
      message = 'Your session has expired. Please log in again.';
    } else if (error.code === 'auth/argument-error') {
      message = 'Invalid authentication token format.';
    }
    return res.status(403).json({ message });
  }
};

export { authenticateToken };
