import { describe, it, expect, beforeEach } from 'vitest';
import bcrypt from 'bcryptjs';

// Mocking a simple auth service for unit testing demonstration
const mockUsersDb = new Map();

const authService = {
  async register(email, password) {
    if (!email || !password) {
      throw new Error('Email and password are required');
    }
    if (mockUsersDb.has(email)) {
      throw new Error('User with this email already exists');
    }
    if (password.length < 8) {
      throw new Error('Password must be at least 8 characters long');
    }
    // Simulate password hashing
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = { email, password: hashedPassword, id: Date.now().toString() };
    mockUsersDb.set(email, newUser);
    return { id: newUser.id, email: newUser.email };
  },

  async login(email, password) {
    if (!email || !password) {
      throw new Error('Email and password are required');
    }
    const user = mockUsersDb.get(email);
    if (!user) {
      throw new Error('Invalid credentials');
    }
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new Error('Invalid credentials');
    }
    // Simulate token generation
    const token = `mock_jwt_token_for_${user.id}`;
    return { token, userId: user.id };
  },

  // For testing purposes, clear the mock DB
  clearDb() {
    mockUsersDb.clear();
  }
};

describe('Auth Service Unit Tests', () => {
  beforeEach(() => {
    authService.clearDb(); // Clear mock DB before each test
  });

  it('should successfully register a new user', async () => {
    const email = 'test@example.com';
    const password = 'SecurePassword123';
    const user = await authService.register(email, password);

    expect(user).toBeDefined();
    expect(user.email).toBe(email);
    expect(mockUsersDb.has(email)).toBe(true);
    const storedUser = mockUsersDb.get(email);
    expect(await bcrypt.compare(password, storedUser.password)).toBe(true);
  });

  it('should throw an error if email or password is missing during registration', async () => {
    await expect(authService.register('no_password@example.com', '')).rejects.toThrow('Email and password are required');
    await expect(authService.register('', 'password123')).rejects.toThrow('Email and password are required');
  });

  it('should throw an error if user already exists during registration', async () => {
    const email = 'existing@example.com';
    const password = 'SecurePassword123';
    await authService.register(email, password);

    await expect(authService.register(email, 'AnotherPassword')).rejects.toThrow('User with this email already exists');
  });

  it('should throw an error if password is too short during registration', async () => {
    const email = 'shortpass@example.com';
    const password = 'short';
    await expect(authService.register(email, password)).rejects.toThrow('Password must be at least 8 characters long');
  });

  it('should successfully log in an existing user', async () => {
    const email = 'login@example.com';
    const password = 'LoginPassword123';
    await authService.register(email, password);

    const loginResult = await authService.login(email, password);
    expect(loginResult).toBeDefined();
    expect(loginResult.token).toMatch(/^mock_jwt_token_for_/);
    expect(loginResult.userId).toBeDefined();
  });

  it('should throw an error for invalid login credentials (wrong password)', async () => {
    const email = 'wrongpass@example.com';
    const password = 'CorrectPassword123';
    await authService.register(email, password);

    await expect(authService.login(email, 'WrongPassword')).rejects.toThrow('Invalid credentials');
  });

  it('should throw an error for invalid login credentials (user not found)', async () => {
    await expect(authService.login('nonexistent@example.com', 'AnyPassword123')).rejects.toThrow('Invalid credentials');
  });

  it('should throw an error if email or password is missing during login', async () => {
    await expect(authService.login('no_password_login@example.com', '')).rejects.toThrow('Email and password are required');
    await expect(authService.login('', 'password123')).rejects.toThrow('Email and password are required');
  });
});