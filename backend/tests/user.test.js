import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import request from 'supertest';
import app from '../src/app.js';
import pool, { initDb } from '../src/config/db.js';
import admin from 'firebase-admin';
import dotenv from 'dotenv';

dotenv.config();

// Mock Firebase Admin SDK for tests to prevent actual Firebase calls
// This is a basic mock. For more complex scenarios, consider a dedicated mocking library.
// Note: For actual integration testing, you might want to use a test Firebase project.
const mockCreateUser = vitest.fn((user) => {
  if (user.email === 'existing@example.com') {
    const error = new Error('Email already in use');
    error.code = 'auth/email-already-in-use';
    throw error;
  }
  return Promise.resolve({ uid: `mock-uid-${Math.random().toString(36).substring(7)}`, email: user.email });
});

vitest.mock('firebase-admin', async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...actual,
    auth: () => ({
      createUser: mockCreateUser,
      // Add other auth methods if needed by controllers
    }),
    credential: {
      cert: vitest.fn(() => ({})), // Mock credential.cert to avoid actual file loading
    },
    initializeApp: vitest.fn(), // Mock initializeApp
  };
});

// Ensure Firebase mock is applied before any imports that use it
// This is done by the vitest.mock call above.

describe('User Authentication Endpoints', () => {
  beforeAll(async () => {
    // Initialize DB and ensure tables are created
    await initDb();
    // Clear users table before tests
    await pool.query('DELETE FROM users;');
  });

  beforeEach(async () => {
    // Clear users table before each test to ensure isolation
    await pool.query('DELETE FROM users;');
    mockCreateUser.mockClear(); // Clear mock calls
  });

  afterAll(async () => {
    // Clean up after all tests
    await pool.query('DELETE FROM users;');
    await pool.end();
  });

  it('should register a new user successfully', async () => {
    const userData = {
      email: 'test@example.com',
      password: 'password123',
      name: 'Test User',
      university: 'Test University',
    };

    const res = await request(app)
      .post('/api/v1/users/register')
      .send(userData)
      .expect(201);

    expect(res.body.status).toBe('success');
    expect(res.body.token).toBeDefined();
    expect(res.body.data.user).toMatchObject({
      email: userData.email,
      name: userData.name,
      university: userData.university,
    });
    expect(res.body.data.user.firebase_uid).toBeDefined();
    expect(mockCreateUser).toHaveBeenCalledTimes(1);

    // Verify user exists in DB
    const { rows } = await pool.query('SELECT * FROM users WHERE email = $1', [userData.email]);
    expect(rows.length).toBe(1);
    expect(rows[0].email).toBe(userData.email);
    expect(rows[0].firebase_uid).toBe(res.body.data.user.firebase_uid);
  });

  it('should return 409 if email is already registered (Firebase conflict)', async () => {
    const userData = {
      email: 'existing@example.com',
      password: 'password123',
      name: 'Existing User',
      university: 'Existing University',
    };

    // Simulate Firebase returning email-already-in-use
    mockCreateUser.mockImplementationOnce(() => {
      const error = new Error('The email address is already in use by another account.');
      error.code = 'auth/email-already-in-use';
      throw error;
    });

    const res = await request(app)
      .post('/api/v1/users/register')
      .send(userData)
      .expect(409);

    expect(res.body.status).toBe('fail');
    expect(res.body.message).toContain('Firebase: Email already in use.');
    expect(mockCreateUser).toHaveBeenCalledTimes(1);
  });

  it('should return 409 if email is already registered (DB conflict)', async () => {
    const userData = {
      email: 'db_existing@example.com',
      password: 'password123',
      name: 'DB Existing User',
      university: 'DB University',
    };

    // First registration
    await request(app).post('/api/v1/users/register').send(userData).expect(201);

    // Second registration attempt with same email
    const res = await request(app)
      .post('/api/v1/users/register')
      .send(userData)
      .expect(409);

    expect(res.body.status).toBe('fail');
    expect(res.body.message).toContain('User with that email already exists.');
    expect(mockCreateUser).toHaveBeenCalledTimes(2); // Called for both attempts
  });

  it('should return 400 for invalid registration input', async () => {
    const userData = {
      email: 'invalid-email',
      password: '123',
      name: '',
      university: 'Test University',
    };

    const res = await request(app)
      .post('/api/v1/users/register')
      .send(userData)
      .expect(400);

    expect(res.body.status).toBe('fail');
    expect(res.body.message).toContain('Email must be a valid email address');
    expect(res.body.message).toContain('Password must be at least 6 characters long');
    expect(res.body.message).toContain('Name is required');
    expect(mockCreateUser).not.toHaveBeenCalled();
  });

  it('should log in an existing user successfully', async () => {
    const userData = {
      email: 'login@example.com',
      password: 'password123',
      name: 'Login User',
      university: 'Login University',
    };

    // Register the user first
    await request(app).post('/api/v1/users/register').send(userData).expect(201);

    // Now attempt to log in
    const res = await request(app)
      .post('/api/v1/users/login')
      .send({ email: userData.email, password: userData.password })
      .expect(200);

    expect(res.body.status).toBe('success');
    expect(res.body.token).toBeDefined();
    expect(res.body.data.user).toMatchObject({
      email: userData.email,
      name: userData.name,
      university: userData.university,
    });
  });

  it('should return 401 for incorrect login password', async () => {
    const userData = {
      email: 'wrongpass@example.com',
      password: 'password123',
      name: 'Wrong Pass User',
      university: 'Wrong Pass University',
    };

    // Register the user first
    await request(app).post('/api/v1/users/register').send(userData).expect(201);

    // Attempt to log in with wrong password
    const res = await request(app)
      .post('/api/v1/users/login')
      .send({ email: userData.email, password: 'wrongpassword' })
      .expect(401);

    expect(res.body.status).toBe('fail');
    expect(res.body.message).toBe('Incorrect email or password.');
  });

  it('should return 401 for non-existent user login', async () => {
    const res = await request(app)
      .post('/api/v1/users/login')
      .send({ email: 'nonexistent@example.com', password: 'password123' })
      .expect(401);

    expect(res.body.status).toBe('fail');
    expect(res.body.message).toBe('Incorrect email or password.');
  });

  it('should return 400 for invalid login input', async () => {
    const res = await request(app)
      .post('/api/v1/users/login')
      .send({ email: 'invalid-email', password: '' })
      .expect(400);

    expect(res.body.status).toBe('fail');
    expect(res.body.message).toContain('Email must be a valid email address');
    expect(res.body.message).toContain('Password is required');
  });
});
