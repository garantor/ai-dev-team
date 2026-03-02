/**
 * @file Implements the API client for interacting with the backend user management system.
 * This client handles authentication with Firebase ID tokens and retrieves user data.
 */

import { LoginResponse, BackendUser, ApiError } from './types';

/**
 * Configuration options for the ApiClient.
 */
interface ApiClientConfig {
  baseURL: string;
  // Potentially add other configuration like default headers, timeout, etc.
}

/**
 * ApiClient class provides methods to interact with the backend API.
 * It encapsulates HTTP requests and error handling.
 */
class ApiClient {
  private baseURL: string;

  /**
   * Creates an instance of ApiClient.
   * @param config Configuration object containing the base URL for the API.
   */
  constructor(config: ApiClientConfig) {
    if (!config.baseURL || typeof config.baseURL !== 'string') {
      throw new Error('ApiClient: baseURL is required and must be a string.');
    }
    this.baseURL = config.baseURL;
  }

  /**
   * Helper method to make API requests.
   * Handles common concerns like JSON parsing, error responses, and network issues.
   * @param endpoint The API endpoint path (e.g., '/auth/firebase-login').
   * @param options Fetch API options (method, headers, body, etc.).
   * @returns A promise that resolves with the parsed JSON response.
   * @throws ApiError if the response status is not OK or a network error occurs.
   */
  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;
    const headers = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    try {
      const response = await fetch(url, { ...options, headers });

      if (!response.ok) {
        let errorData: any;
        try {
          // Attempt to parse error details from JSON response
          errorData = await response.json();
        } catch (jsonError) {
          // If response is not JSON, use text or default message
          errorData = { message: await response.text() || `API request failed with status ${response.status}` };
        }
        throw new ApiError(
          errorData.message || `API request failed with status ${response.status}`,
          response.status,
          errorData
        );
      }

      // Handle cases where the response might be empty (e.g., 204 No Content)
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        return (await response.json()) as T;
      }
      // For non-JSON successful responses (e.g., 204 No Content), return an empty object
      return {} as T;
    } catch (error) {
      if (error instanceof ApiError) {
        throw error; // Re-throw custom API errors
      }
      // Catch network errors or other unexpected errors during fetch
      throw new ApiError(
        `Network error or unexpected issue: ${error instanceof Error ? error.message : String(error)}`,
        0 // Use 0 for network errors as there's no HTTP status code
      );
    }
  }

  /**
   * Authenticates a user with a Firebase ID token by sending it to the backend.
   * The backend verifies the token, manages user creation/linking, and returns
   * a backend session token and user profile.
   * @param idToken The Firebase ID token obtained from the client-side Firebase SDK.
   * @returns A promise that resolves with the backend's login response.
   * @throws Error if the idToken is invalid or ApiError for backend-specific issues.
   */
  public async loginWithFirebaseToken(idToken: string): Promise<LoginResponse> {
    if (!idToken || typeof idToken !== 'string') {
      throw new Error('Firebase ID token must be a non-empty string.');
    }

    return this.request<LoginResponse>('/auth/firebase-login', {
      method: 'POST',
      body: JSON.stringify({ idToken }),
    });
  }

  /**
   * Retrieves the current user's profile from the backend.
   * This endpoint typically requires a backend session token for authorization.
   * @param backendSessionToken The session token obtained from the backend after login.
   * @returns A promise that resolves with the current user's profile.
   * @throws Error if the backendSessionToken is invalid or ApiError for backend issues.
   */
  public async getCurrentUserProfile(backendSessionToken: string): Promise<BackendUser> {
    if (!backendSessionToken || typeof backendSessionToken !== 'string') {
      throw new Error('Backend session token must be a non-empty string.');
    }

    return this.request<BackendUser>('/users/me', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${backendSessionToken}`,
      },
    });
  }

  // Add other API methods as needed for user management (e.g., logout, update profile, etc.)
}

export { ApiClient };
