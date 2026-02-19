import bcrypt from 'bcryptjs';
import admin from '../config/firebase.js';
import UserModel from '../models/userModel.js';
import { generateToken } from '../utils/jwt.js';
import { BadRequestError, ConflictError, UnauthorizedError } from '../utils/AppError.js';

export const registerUser = async (req, res, next) => {
  try {
    const { email, password, name, university } = req.body;

    // 1. Check if user already exists in our DB
    const existingUser = await UserModel.findByEmail(email);
    if (existingUser) {
      return next(new ConflictError('User with that email already exists.'));
    }

    // 2. Hash password for our database
    const hashedPassword = await bcrypt.hash(password, 12);

    let firebaseUser;
    try {
      // 3. Create user in Firebase Authentication
      firebaseUser = await admin.auth().createUser({
        email,
        password,
        displayName: name,
      });
    } catch (firebaseError) {
      // Handle Firebase specific errors
      if (firebaseError.code === 'auth/email-already-in-use') {
        return next(new ConflictError('Firebase: Email already in use.'));
      } else if (firebaseError.code === 'auth/invalid-password') {
        return next(new BadRequestError('Firebase: Password should be at least 6 characters.'));
      } else {
        console.error('Firebase user creation error:', firebaseError);
        return next(new BadRequestError(`Firebase error: ${firebaseError.message}`));
      }
    }

    // 4. Store user details in PostgreSQL
    const newUser = await UserModel.create({
      firebase_uid: firebaseUser.uid,
      email,
      password: hashedPassword, // Store hashed password for backend verification
      name,
      university,
    });

    // 5. Generate JWT token for the session
    const token = generateToken({
      id: newUser.id,
      firebase_uid: newUser.firebase_uid,
      email: newUser.email,
    });

    res.status(201).json({
      status: 'success',
      token,
      data: {
        user: {
          id: newUser.id,
          firebase_uid: newUser.firebase_uid,
          email: newUser.email,
          name: newUser.name,
          university: newUser.university,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

export const loginUser = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // 1. Check if user exists in our DB
    const user = await UserModel.findByEmail(email);
    if (!user) {
      return next(new UnauthorizedError('Incorrect email or password.'));
    }

    // 2. Compare password with the hashed password in our DB
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return next(new UnauthorizedError('Incorrect email or password.'));
    }

    // 3. Generate JWT token for the session
    const token = generateToken({
      id: user.id,
      firebase_uid: user.firebase_uid,
      email: user.email,
    });

    res.status(200).json({
      status: 'success',
      token,
      data: {
        user: {
          id: user.id,
          firebase_uid: user.firebase_uid,
          email: user.email,
          name: user.name,
          university: user.university,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};
