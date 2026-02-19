import { describe, it, expect, beforeAll, afterAll, vi } from 'vitest';
import request from 'supertest';
import app from '../src/app.js';
import firebaseAuth from '../src/config/firebase.js';
import UserModel from '../src/models/userModel.js';
import pool from '../src/config/db.js';
import axios from 'axios';

// Mock Firebase Admin SDK
vi.mock('../src/config/firebase.js', () => ({
  default: {
    createUser: vi.fn(),
    getUserByEmail: vi.fn(),
    deleteUser: vi.fn(),
  },
}));

// Mock UserModel
vi.mock('../src/models/userModel.js', () => ({
  default: {
    createUser: vi.fn(),
    findByFirebaseUid: vi.fn(),
    findByEmail: vi.fn(),
  },
}));

// Mock PostgreSQL pool for tests that don't need actual DB interaction
vi.mock('../src/config/db.js', () => ({
  default: {
    query: vi.fn(() => ({ rows: [] })),
    on: vi.fn(),
  },
}));

// Mock axios for Firebase REST API calls
vi.mock('axios');

describe('User Authentication Endpoints', () => {
  const testUser = {
    email: 'test@example.com',
    password: 'password123',
    name: 'Test User',
    university: 'Test University',
  };
  const firebaseUid = 'firebase-uid-123';
  const dbUserId = 1;

  beforeAll(() => {
    // Set environment variables for tests
    process.env.JWT_SECRET = 'test_jwt_secret';
    process.env.JWT_EXPIRES_IN = '1h';
    process.env.FIREBASE_WEB_API_KEY = 'test_firebase_web_api_key';
    process.env.FIREBASE_SERVICE_ACCOUNT_KEY = JSON.stringify({
      type: 'service_account',
      project_id: 'test-project',
      private_key_id: 'test-key-id',
      private_key: '-----BEGIN PRIVATE KEY-----\nTEST_PRIVATE_KEY\n-----END PRIVATE KEY-----\n',
      client_email: 'test@test-project.iam.gserviceaccount.com',
      client_id: 'test-client-id',
      auth_uri: 'https://accounts.google.com/o/oauth2/auth',
      token_uri: 'https://oauth2.googleapis.com/token',
      auth_provider_x509_cert_url: 'https://www.googleapis.com/oauth2/v1/certs',
      client_x509_cert_url: 'https://www.googleapis.com/robot/v1/metadata/x509/test@test-project.iam.gserviceaccount.com',
      universe_domain: 'googleapis.com'
    });
  });

  afterAll(() => {
    vi.clearAllMocks();
  });

  describe('POST /api/v1/users/register', () => {
    it('should register a new user and return a JWT token', async () => {
      firebaseAuth.createUser.mockResolvedValueOnce({ uid: firebaseUid });
      UserModel.createUser.mockResolvedValueOnce({
        id: dbUserId,
        firebase_uid: firebaseUid,
        ...testUser,
      });

      const res = await request(app)
        .post('/api/v1/users/register')
        .send(testUser);

      expect(res.statusCode).toEqual(201);
      expect(res.body).toHaveProperty('token');
      expect(res.body.user.email).toEqual(testUser.email);
      expect(firebaseAuth.createUser).toHaveBeenCalledWith({
        email: testUser.email,
        password: testUser.password,
        displayName: testUser.name,
      });
      expect(UserModel.createUser).toHaveBeenCalledWith({
        firebase_uid: firebaseUid,
        email: testUser.email,
        name: testUser.name,
        university: testUser.university,
      });
    });

    it('should return 409 if email is already registered in Firebase', async () => {
      firebaseAuth.createUser.mockRejectedValueOnce({ code: 'auth/email-already-exists' });

      const res = await request(app)
        .post('/api/v1/users/register')
        .send(testUser);

      expect(res.statusCode).toEqual(409);
      expect(res.body.message).toEqual('Email already registered.');
    });

    it('should return 400 for invalid input', async () => {
      const invalidUser = { ...testUser, email: 'invalid-email' };

      const res = await request(app)
        .post('/api/v1/users/register')
        .send(invalidUser);

      expect(res.statusCode).toEqual(400);
      expect(res.body).toHaveProperty('errors');
      expect(res.body.errors).toContain('Email must be a valid email address.');
    });

    it('should handle other Firebase errors gracefully', async () => {
      firebaseAuth.createUser.mockRejectedValueOnce(new Error('Some Firebase error'));

      const res = await request(app)
        .post('/api/v1/users/register')
        .send(testUser);

      expect(res.statusCode).toEqual(500);
      expect(res.body.message).toEqual('An unexpected error occurred.');
    });
  });

  describe('POST /api/v1/users/login', () => {
    it('should log in a user and return a JWT token', async () => {
      axios.post.mockResolvedValueOnce({
        data: { localId: firebaseUid, idToken: 'firebase-id-token' },
      });
      UserModel.findByFirebaseUid.mockResolvedValueOnce({
        id: dbUserId,
        firebase_uid: firebaseUid,
        ...testUser,
      });

      const res = await request(app)
        .post('/api/v1/users/login')
        .send({ email: testUser.email, password: testUser.password });

      expect(res.statusCode).toEqual(200);
      expect(res.body).toHaveProperty('token');
      expect(res.body.user.email).toEqual(testUser.email);
      expect(axios.post).toHaveBeenCalledWith(
        `https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${process.env.FIREBASE_WEB_API_KEY}`,
        {
          email: testUser.email,
          password: testUser.password,
          returnSecureToken: true,
        }
      );
      expect(UserModel.findByFirebaseUid).toHaveBeenCalledWith(firebaseUid);
    });

    it('should return 401 for invalid credentials (email not found)', async () => {
      axios.post.mockRejectedValueOnce({
        response: { data: { error: { message: 'EMAIL_NOT_FOUND' } } },
      });

      const res = await request(app)
        .post('/api/v1/users/login')
        .send({ email: 'nonexistent@example.com', password: 'wrongpassword' });

      expect(res.statusCode).toEqual(401);
      expect(res.body.message).toEqual('Invalid credentials.');
    });

    it('should return 401 for invalid credentials (wrong password)', async () => {
      axios.post.mockRejectedValueOnce({
        response: { data: { error: { message: 'INVALID_PASSWORD' } } },
      });

      const res = await request(app)
        .post('/api/v1/users/login')
        .send({ email: testUser.email, password: 'wrongpassword' });

      expect(res.statusCode).toEqual(401);
      expect(res.body.message).toEqual('Invalid credentials.');
    });

    it('should return 403 if user account is disabled', async () => {
      axios.post.mockRejectedValueOnce({
        response: { data: { error: { message: 'USER_DISABLED' } } },
      });

      const res = await request(app)
        .post('/api/v1/users/login')
        .send({ email: testUser.email, password: testUser.password });

      expect(res.statusCode).toEqual(403);
      expect(res.body.message).toEqual('User account has been disabled.');
    });

    it('should return 400 for invalid input', async () => {
      const invalidLogin = { email: 'invalid-email', password: '123' };

      const res = await request(app)
        .post('/api/v1/users/login')
        .send(invalidLogin);

      expect(res.statusCode).toEqual(400);
      expect(res.body).toHaveProperty('errors');
      expect(res.body.errors).toContain('Email must be a valid email address.');
    });

    it('should return 404 if user exists in Firebase but not in our DB', async () => {
      axios.post.mockResolvedValueOnce({
        data: { localId: firebaseUid, idToken: 'firebase-id-token' },
      });
      UserModel.findByFirebaseUid.mockResolvedValueOnce(null); // User not found in our DB

      const res = await request(app)
        .post('/api/v1/users/login')
        .send({ email: testUser.email, password: testUser.password });

      expect(res.statusCode).toEqual(404);
      expect(res.body.message).toEqual('User not found in database. Please contact support.');
    });

    it('should handle other axios/network errors gracefully', async () => {
      axios.post.mockRejectedValueOnce(new Error('Network error'));

      const res = await request(app)
        .post('/api/v1/users/login')
        .send({ email: testUser.email, password: testUser.password });

      expect(res.statusCode).toEqual(500);
      expect(res.body.message).toEqual('An unexpected error occurred.');
    });
  });
});
