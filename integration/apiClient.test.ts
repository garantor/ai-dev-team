/**
 * @file Contract tests for the ApiClient.
 * These tests mock the `fetch` API to simulate backend responses and verify
 * the client's behavior according to the expected API contract.
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ApiClient } from './apiClient';
import { ApiError, LoginResponse, BackendUser } from './types';

// Mock global.fetch to prevent actual network requests during tests
const mockFetch = vi.fn();
global.fetch = mockFetch;

describe('ApiClient', () => {
  const baseURL = 'http://localhost:3000/api';
  let apiClient: ApiClient;

  beforeEach(() => {
    // Reset the API client and mock fetch before each test
    apiClient = new ApiClient({ baseURL });
    mockFetch.mockClear();
  });

  it('should be initialized with a base URL', () => {
    expect(apiClient).toBeInstanceOf(ApiClient);
  });

  it('should throw an error if baseURL is not provided', () => {
    expect(() => new ApiClient({ baseURL: '' })).toThrow('ApiClient: baseURL is required and must be a string.');
    // @ts-ignore - testing invalid input
    expect(() => new ApiClient({ baseURL: 123 })).toThrow('ApiClient: baseURL is required and must be a string.');
  });

  describe('loginWithFirebaseToken', () => {
    const mockIdToken = 'mock-firebase-id-token-123';
    const mockLoginResponse: LoginResponse = {
      user: {
        id: 'user-abc-123',
        email: 'test@example.com',
        displayName: 'Test User',
      },
      backendSessionToken: 'mock-backend-session-token-xyz',
    };

    it('should successfully log in with a Firebase ID token', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        headers: new Headers({ 'Content-Type': 'application/json' }),
        json: () => Promise.resolve(mockLoginResponse),
      });

      const response = await apiClient.loginWithFirebaseToken(mockIdToken);

      expect(mockFetch).toHaveBeenCalledTimes(1);
      expect(mockFetch).toHaveBeenCalledWith(`${baseURL}/auth/firebase-login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ idToken: mockIdToken }),
      });
      expect(response).toEqual(mockLoginResponse);
    });

    it('should throw ApiError for an invalid Firebase ID token (401 Unauthorized)', async () => {
      const errorResponse = { message: 'Invalid Firebase ID token', code: 'auth/invalid-token' };
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 401,
        headers: new Headers({ 'Content-Type': 'application/json' }),
        json: () => Promise.resolve(errorResponse),
      });

      await expect(apiClient.loginWithFirebaseToken(mockIdToken)).rejects.toThrow(ApiError);
      const error = await apiClient.loginWithFirebaseToken(mockIdToken).catch(e => e);
      expect(error).toHaveProperty('statusCode', 401);
      expect(error).toHaveProperty('data', errorResponse);
      expect(error).toHaveProperty('message', errorResponse.message);
    });

    it('should throw ApiError for a server error (500 Internal Server Error)', async () => {
      const errorResponse = { message: 'Internal server error', code: 'server/error' };
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
        headers: new Headers({ 'Content-Type': 'application/json' }),
        json: () => Promise.resolve(errorResponse),
      });

      await expect(apiClient.loginWithFirebaseToken(mockIdToken)).rejects.toThrow(ApiError);
      const error = await apiClient.loginWithFirebaseToken(mockIdToken).catch(e => e);
      expect(error).toHaveProperty('statusCode', 500);
      expect(error).toHaveProperty('data', errorResponse);
      expect(error).toHaveProperty('message', errorResponse.message);
    });

    it('should throw ApiError for a network error', async () => {
      mockFetch.mockRejectedValueOnce(new TypeError('Failed to fetch'));

      await expect(apiClient.loginWithFirebaseToken(mockIdToken)).rejects.toThrow(ApiError);
      const error = await apiClient.loginWithFirebaseToken(mockIdToken).catch(e => e);
      expect(error).toHaveProperty('statusCode', 0); // 0 for network errors
      expect(error).toHaveProperty('message', expect.stringContaining('Network error or unexpected issue'));
    });

    it('should throw an error if idToken is not a string', async () => {
      // @ts-ignore - testing invalid input
      await expect(apiClient.loginWithFirebaseToken(null)).rejects.toThrow('Firebase ID token must be a non-empty string.');
      // @ts-ignore
      await expect(apiClient.loginWithFirebaseToken(undefined)).rejects.toThrow('Firebase ID token must be a non-empty string.');
      // @ts-ignore
      await expect(apiClient.loginWithFirebaseToken(123)).rejects.toThrow('Firebase ID token must be a non-empty string.');
    });

    it('should throw an error if idToken is an empty string', async () => {
      await expect(apiClient.loginWithFirebaseToken('')).rejects.toThrow('Firebase ID token must be a non-empty string.');
    });
  });

  describe('getCurrentUserProfile', () => {
    const mockBackendSessionToken = 'mock-backend-session-token-xyz';
    const mockUserProfile: BackendUser = {
      id: 'user-abc-123',
      email: 'test@example.com',
      displayName: 'Test User',
      photoURL: 'http://example.com/photo.jpg',
    };

    it('should successfully fetch the current user profile', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        headers: new Headers({ 'Content-Type': 'application/json' }),
        json: () => Promise.resolve(mockUserProfile),
      });

      const response = await apiClient.getCurrentUserProfile(mockBackendSessionToken);

      expect(mockFetch).toHaveBeenCalledTimes(1);
      expect(mockFetch).toHaveBeenCalledWith(`${baseURL}/users/me`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${mockBackendSessionToken}`,
        },
      });
      expect(response).toEqual(mockUserProfile);
    });

    it('should throw ApiError if session token is invalid (401 Unauthorized)', async () => {
      const errorResponse = { message: 'Invalid session token', code: 'auth/invalid-session' };
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 401,
        headers: new Headers({ 'Content-Type': 'application/json' }),
        json: () => Promise.resolve(errorResponse),
      });

      await expect(apiClient.getCurrentUserProfile(mockBackendSessionToken)).rejects.toThrow(ApiError);
      const error = await apiClient.getCurrentUserProfile(mockBackendSessionToken).catch(e => e);
      expect(error).toHaveProperty('statusCode', 401);
      expect(error).toHaveProperty('data', errorResponse);
      expect(error).toHaveProperty('message', errorResponse.message);
    });

    it('should throw an error if backendSessionToken is not a string', async () => {
      // @ts-ignore
      await expect(apiClient.getCurrentUserProfile(null)).rejects.toThrow('Backend session token must be a non-empty string.');
      // @ts-ignore
      await expect(apiClient.getCurrentUserProfile(undefined)).rejects.toThrow('Backend session token must be a non-empty string.');
    });

    it('should throw an error if backendSessionToken is an empty string', async () => {
      await expect(apiClient.getCurrentUserProfile('')).rejects.toThrow('Backend session token must be a non-empty string.');
    });
  });
});
