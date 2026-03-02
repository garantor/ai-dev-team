/**
 * @file Defines type interfaces and custom error classes for the backend API client.
 */

/**
 * Represents a user profile as returned by the backend after successful authentication.
 */
export interface BackendUser {
  id: string;
  email: string;
  displayName?: string;
  photoURL?: string;
  // Add any other user-specific fields managed by your backend
}

/**
 * Represents the response from the backend's Firebase login endpoint.
 * Includes the user profile and a session token issued by your backend.
 */
export interface LoginResponse {
  user: BackendUser;
  backendSessionToken: string; // Token issued by your backend for subsequent authenticated requests
}

/**
 * Custom error class for API-related errors.
 * Provides more context about the error, including HTTP status code and raw error data.
 */
export class ApiError extends Error {
  statusCode: number;
  data?: any;

  constructor(message: string, statusCode: number, data?: any) {
    super(message);
    this.name = 'ApiError';
    this.statusCode = statusCode;
    this.data = data;
    // Ensure proper prototype chain for custom errors in TypeScript
    Object.setPrototypeOf(this, ApiError.prototype);
  }
}
