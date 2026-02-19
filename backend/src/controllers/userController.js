import jwt from 'jsonwebtoken';
import axios from 'axios';
import firebaseAuth from '../config/firebase.js';
import UserModel from '../models/userModel.js';
import { JWT_SECRET, JWT_EXPIRES_IN } from '../config/jwt.js';

// Ensure FIREBASE_WEB_API_KEY is set for login verification
if (!process.env.FIREBASE_WEB_API_KEY) {
  console.error('FIREBASE_WEB_API_KEY is not defined in environment variables. Login verification will fail.');
  process.exit(1);
}
const FIREBASE_WEB_API_KEY = process.env.FIREBASE_WEB_API_KEY;

/**
 * Generates a JWT token for the authenticated user.
 * @param {string} firebase_uid - The Firebase UID of the user.
 * @returns {string} The generated JWT token.
 */
const generateToken = (firebase_uid) => {
  return jwt.sign({ uid: firebase_uid }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
};

/**
 * Handles user registration.
 * Creates a user in Firebase Auth and stores details in PostgreSQL.
 */
export const registerUser = async (req, res, next) => {
  const { email, password, name, university } = req.body;

  try {
    // 1. Create user in Firebase Authentication
    const userRecord = await firebaseAuth.createUser({
      email,
      password,
      displayName: name,
    });

    const firebase_uid = userRecord.uid;

    // 2. Store user details in PostgreSQL
    const newUser = await UserModel.createUser({
      firebase_uid,
      email,
      name,
      university,
    });

    // 3. Generate and return JWT token
    const token = generateToken(firebase_uid);

    res.status(201).json({
      message: 'User registered successfully',
      token,
      user: {
        id: newUser.id,
        firebase_uid: newUser.firebase_uid,
        email: newUser.email,
        name: newUser.name,
        university: newUser.university,
      },
    });
  } catch (error) {
    // Handle Firebase specific errors
    if (error.code === 'auth/email-already-exists') {
      return res.status(409).json({ message: 'Email already registered.' });
    }
    // Handle other errors
    next(error);
  }
};

/**
 * Handles user login.
 * Verifies credentials with Firebase and returns a JWT token.
 */
export const loginUser = async (req, res, next) => {
  const { email, password } = req.body;

  try {
    // 1. Verify user credentials with Firebase using the REST API (since Admin SDK doesn't have direct password verification)
    const firebaseLoginResponse = await axios.post(
      `https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${FIREBASE_WEB_API_KEY}`,
      {
        email,
        password,
        returnSecureToken: true,
      }
    );

    const firebase_uid = firebaseLoginResponse.data.localId;

    // 2. Check if the user exists in our PostgreSQL database
    const user = await UserModel.findByFirebaseUid(firebase_uid);

    if (!user) {
      // This scenario should ideally not happen if registration is handled correctly
      // but acts as a safeguard if a user exists in Firebase but not our DB.
      return res.status(404).json({ message: 'User not found in database. Please contact support.' });
    }

    // 3. Generate and return JWT token
    const token = generateToken(firebase_uid);

    res.status(200).json({
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        firebase_uid: user.firebase_uid,
        email: user.email,
        name: user.name,
        university: user.university,
      },
    });
  } catch (error) {
    // Handle Firebase REST API errors
    if (error.response && error.response.data && error.response.data.error) {
      const firebaseError = error.response.data.error;
      if (firebaseError.message === 'EMAIL_NOT_FOUND' || firebaseError.message === 'INVALID_PASSWORD') {
        return res.status(401).json({ message: 'Invalid credentials.' });
      }
      if (firebaseError.message === 'USER_DISABLED') {
        return res.status(403).json({ message: 'User account has been disabled.' });
      }
      // Log other Firebase errors for debugging
      console.error('Firebase Login API Error:', firebaseError);
      return res.status(500).json({ message: 'Firebase authentication failed.' });
    }
    // Handle other errors
    next(error);
  }
};
