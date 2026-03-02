import { auth } from '../config/firebase.js';
import { validationResult } from 'express-validator';

/**
 * Helper function to standardize Firebase error responses.
 * @param {object} res - Express response object.
 * @param {object} error - Firebase error object.
 */
const handleFirebaseError = (res, error) => {
  console.error('Firebase error:', error.code, error.message);
  let statusCode = 500;
  let message = 'An unexpected error occurred.';

  switch (error.code) {
    case 'auth/email-already-exists':
      statusCode = 409; // Conflict
      message = 'The email address is already in use by another account.';
      break;
    case 'auth/invalid-email':
      statusCode = 400; // Bad Request
      message = 'The email address is not valid.';
      break;
    case 'auth/invalid-password':
      statusCode = 400; // Bad Request
      message = 'The password must be a string with at least 6 characters.';
      break;
    case 'auth/user-not-found':
      statusCode = 404; // Not Found
      message = 'No user corresponding to the given identifier.';
      break;
    case 'auth/wrong-password': // This error code is typically from client SDK, but good to handle defensively
      statusCode = 401; // Unauthorized
      message = 'Wrong password.';
      break;
    case 'auth/id-token-expired':
    case 'auth/argument-error':
      statusCode = 403; // Forbidden
      message = 'Invalid or expired authentication token.';
      break;
    case 'auth/uid-already-exists':
      statusCode = 409;
      message = 'The provided UID is already in use by an existing user.';
      break;
    default:
      // Catch generic errors that might contain useful messages
      if (error.message.includes('password')) {
        statusCode = 400;
        message = error.message;
      }
      break;
  }
  return res.status(statusCode).json({ message });
};

/**
 * Registers a new user with Firebase Authentication.
 * Expects email and password in the request body.
 */
const registerUser = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { email, password } = req.body;

  try {
    const userRecord = await auth.createUser({
      email,
      password,
      emailVerified: false, // Set to true if you handle verification separately
      disabled: false,
    });

    // For security, avoid returning sensitive user data directly.
    // Client should perform login after registration to get an ID token.
    return res.status(201).json({
      message: 'User registered successfully. Please log in.',
      uid: userRecord.uid,
      email: userRecord.email,
    });
  } catch (error) {
    return handleFirebaseError(res, error);
  }
};

/**
 * Verifies a Firebase ID token provided by the client after a successful client-side login.
 * Returns basic user information if the token is valid.
 * This endpoint acts as a backend verification of client-side authentication.
 */
const loginUser = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { idToken } = req.body;

  try {
    const decodedToken = await auth.verifyIdToken(idToken);
    // Fetch the full user record for more details if needed
    const userRecord = await auth.getUser(decodedToken.uid);

    return res.status(200).json({
      message: 'User logged in successfully.',
      uid: userRecord.uid,
      email: userRecord.email,
      emailVerified: userRecord.emailVerified,
      displayName: userRecord.displayName || null,
      photoURL: userRecord.photoURL || null,
      // You can add more profile data here if stored in Firebase Auth
    });
  } catch (error) {
    return handleFirebaseError(res, error);
  }
};

/**
 * Retrieves the profile of the authenticated user.
 * Requires a valid Firebase ID token in the Authorization header.
 * The `authenticateToken` middleware populates `req.user`.
 */
const getProfile = async (req, res) => {
  // req.user is populated by the authenticateToken middleware
  if (!req.user || !req.user.uid) {
    return res.status(401).json({ message: 'Authentication required to access profile.' });
  }

  try {
    const userRecord = await auth.getUser(req.user.uid);
    return res.status(200).json({
      uid: userRecord.uid,
      email: userRecord.email,
      emailVerified: userRecord.emailVerified,
      displayName: userRecord.displayName || null,
      photoURL: userRecord.photoURL || null,
      // Exclude sensitive data like password hash
    });
  } catch (error) {
    return handleFirebaseError(res, error);
  }
};

export { registerUser, loginUser, getProfile };
