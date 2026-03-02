import { describe, it, expect, beforeEach, vi } from 'vitest';
import request from 'supertest';
import app from '../src/app.js';
import { auth } from '../config/firebase.js'; // Import the actual auth object

// Mock firebase-admin auth methods
// This ensures that tests do not make actual calls to Firebase services.
vi.mock('../config/firebase.js', () => {
  const mockAuth = {
    createUser: vi.fn(),
    verifyIdToken: vi.fn(),
    getUser: vi.fn(),
  };
  return { auth: mockAuth };
});

describe('Auth API', () => {
  const mockUser = {
    uid: 'test-uid-123',
    email: 'test@example.com',
    password: 'Password123!',
    emailVerified: true,
    displayName: 'Test User',
    photoURL: 'http://example.com/photo.jpg',
  };

  const mockIdToken = 'mock-firebase-id-token';
  const mockDecodedToken = {
    uid: mockUser.uid,
    email: mockUser.email,
    exp: Math.floor(Date.now() / 1000) + 3600, // 1 hour from now
  };

  beforeEach(() => {
    // Reset mocks before each test to ensure isolation
    vi.clearAllMocks();
  });

  describe('POST /api/auth/register', () => {
    it('should register a new user successfully', async () => {
      auth.createUser.mockResolvedValue({
        uid: mockUser.uid,
        email: mockUser.email,
      });

      const res = await request(app)
        .post('/api/auth/register')
        .send({
          email: mockUser.email,
          password: mockUser.password,
        });

      expect(res.statusCode).toEqual(201);
      expect(res.body).toHaveProperty('message', 'User registered successfully. Please log in.');
      expect(res.body).toHaveProperty('uid', mockUser.uid);
      expect(res.body).toHaveProperty('email', mockUser.email);
      expect(auth.createUser).toHaveBeenCalledWith({
        email: mockUser.email,
        password: mockUser.password,
        emailVerified: false,
        disabled: false,
      });
    });

    it('should return 400 if validation fails (invalid email)', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          email: 'invalid-email',
          password: mockUser.password,
        });

      expect(res.statusCode).toEqual(400);
      expect(res.body).toHaveProperty('errors');
      expect(res.body.errors[0]).toHaveProperty('msg', 'Please enter a valid email address.');
    });

    it('should return 400 if validation fails (weak password)', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          email: mockUser.email,
          password: 'short', // Fails length, uppercase, number, special char
        });

      expect(res.statusCode).toEqual(400);
      expect(res.body).toHaveProperty('errors');
      // Expect multiple password validation errors
      expect(res.body.errors.length).toBeGreaterThan(1);
      expect(res.body.errors).toEqual(expect.arrayContaining([
        expect.objectContaining({ msg: 'Password must be at least 6 characters long.' }),
        expect.objectContaining({ msg: 'Password must contain at least one uppercase letter.' }),
        expect.objectContaining({ msg: 'Password must contain at least one lowercase letter.' }),
        expect.objectContaining({ msg: 'Password must contain at least one number.' }),
        expect.objectContaining({ msg: 'Password must contain at least one special character.' })
      ]));
    });

    it('should return 409 if email already exists', async () => {
      auth.createUser.mockRejectedValue({
        code: 'auth/email-already-exists',
        message: 'The email address is already in use by another account.',
      });

      const res = await request(app)
        .post('/api/auth/register')
        .send({
          email: mockUser.email,
          password: mockUser.password,
        });

      expect(res.statusCode).toEqual(409);
      expect(res.body).toHaveProperty('message', 'The email address is already in use by another account.');
    });

    it('should return 500 for other Firebase errors during registration', async () => {
      auth.createUser.mockRejectedValue(new Error('Some unexpected Firebase error'));

      const res = await request(app)
        .post('/api/auth/register')
        .send({
          email: 'another@example.com',
          password: mockUser.password,
        });

      expect(res.statusCode).toEqual(500);
      expect(res.body).toHaveProperty('message', 'An unexpected error occurred.');
    });
  });

  describe('POST /api/auth/login', () => {
    it('should verify ID token and return user info successfully', async () => {
      auth.verifyIdToken.mockResolvedValue(mockDecodedToken);
      auth.getUser.mockResolvedValue(mockUser);

      const res = await request(app)
        .post('/api/auth/login')
        .send({ idToken: mockIdToken });

      expect(res.statusCode).toEqual(200);
      expect(res.body).toHaveProperty('message', 'User logged in successfully.');
      expect(res.body).toHaveProperty('uid', mockUser.uid);
      expect(res.body).toHaveProperty('email', mockUser.email);
      expect(res.body).toHaveProperty('displayName', mockUser.displayName);
      expect(auth.verifyIdToken).toHaveBeenCalledWith(mockIdToken);
      expect(auth.getUser).toHaveBeenCalledWith(mockUser.uid);
    });

    it('should return 400 if ID token is missing', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({});

      expect(res.statusCode).toEqual(400);
      expect(res.body).toHaveProperty('errors');
      expect(res.body.errors[0]).toHaveProperty('msg', 'ID token is required.');
    });

    it('should return 403 if ID token is invalid or expired', async () => {
      auth.verifyIdToken.mockRejectedValue({
        code: 'auth/id-token-expired',
        message: 'Firebase ID token has expired.',
      });

      const res = await request(app)
        .post('/api/auth/login')
        .send({ idToken: 'invalid-token' });

      expect(res.statusCode).toEqual(403);
      expect(res.body).toHaveProperty('message', 'Your session has expired. Please log in again.');
      expect(auth.verifyIdToken).toHaveBeenCalledWith('invalid-token');
    });

    it('should return 403 for other token verification errors', async () => {
      auth.verifyIdToken.mockRejectedValue({
        code: 'auth/argument-error',
        message: 'Invalid token format.',
      });

      const res = await request(app)
        .post('/api/auth/login')
        .send({ idToken: 'malformed-token' });

      expect(res.statusCode).toEqual(403);
      expect(res.body).toHaveProperty('message', 'Invalid authentication token format.');
    });

    it('should return 404 if user not found after token verification', async () => {
      auth.verifyIdToken.mockResolvedValue(mockDecodedToken);
      auth.getUser.mockRejectedValue({
        code: 'auth/user-not-found',
        message: 'There is no user record corresponding to the provided identifier.',
      });

      const res = await request(app)
        .post('/api/auth/login')
        .send({ idToken: mockIdToken });

      expect(res.statusCode).toEqual(404);
      expect(res.body).toHaveProperty('message', 'No user corresponding to the given identifier.');
    });
  });

  describe('GET /api/auth/profile', () => {
    it('should return user profile if authenticated', async () => {
      auth.verifyIdToken.mockResolvedValue(mockDecodedToken);
      auth.getUser.mockResolvedValue(mockUser);

      const res = await request(app)
        .get('/api/auth/profile')
        .set('Authorization', `Bearer ${mockIdToken}`);

      expect(res.statusCode).toEqual(200);
      expect(res.body).toHaveProperty('uid', mockUser.uid);
      expect(res.body).toHaveProperty('email', mockUser.email);
      expect(res.body).toHaveProperty('displayName', mockUser.displayName);
      expect(auth.verifyIdToken).toHaveBeenCalledWith(mockIdToken);
      expect(auth.getUser).toHaveBeenCalledWith(mockUser.uid);
    });

    it('should return 401 if no token is provided', async () => {
      const res = await request(app)
        .get('/api/auth/profile');

      expect(res.statusCode).toEqual(401);
      expect(res.body).toHaveProperty('message', 'No token provided, authorization denied.');
    });

    it('should return 403 if token is invalid or expired', async () => {
      auth.verifyIdToken.mockRejectedValue({
        code: 'auth/id-token-expired',
        message: 'Firebase ID token has expired.',
      });

      const res = await request(app)
        .get('/api/auth/profile')
        .set('Authorization', 'Bearer invalid-token');

      expect(res.statusCode).toEqual(403);
      expect(res.body).toHaveProperty('message', 'Your session has expired. Please log in again.');
    });

    it('should return 404 if user not found after token verification', async () => {
      auth.verifyIdToken.mockResolvedValue(mockDecodedToken);
      auth.getUser.mockRejectedValue({
        code: 'auth/user-not-found',
        message: 'There is no user record corresponding to the provided identifier.',
      });

      const res = await request(app)
        .get('/api/auth/profile')
        .set('Authorization', `Bearer ${mockIdToken}`);

      expect(res.statusCode).toEqual(404);
      expect(res.body).toHaveProperty('message', 'No user corresponding to the given identifier.');
    });

    it('should return 500 for other Firebase errors during profile retrieval', async () => {
      auth.verifyIdToken.mockResolvedValue(mockDecodedToken);
      auth.getUser.mockRejectedValue(new Error('Database connection failed'));

      const res = await request(app)
        .get('/api/auth/profile')
        .set('Authorization', `Bearer ${mockIdToken}`);

      expect(res.statusCode).toEqual(500);
      expect(res.body).toHaveProperty('message', 'An unexpected error occurred.');
    });
  });
});
