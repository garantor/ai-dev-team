/**
 * @file API client for interacting with the Deployment Service.
 * Provides methods to fetch deployment information, trigger new deployments, and check service health.
 */

import { Deployment, DeploymentRequest, HealthStatus, ApiError } from './types';

/**
 * Custom error class for API-specific errors.
 */
export class DeploymentApiClientError extends Error {
  public readonly statusCode: number;
  public readonly details?: string;
  public readonly errorCode?: string;

  constructor(message: string, statusCode: number, details?: string, errorCode?: string) {
    super(message);
    this.name = 'DeploymentApiClientError';
    this.statusCode = statusCode;
    this.details = details;
    this.errorCode = errorCode;
    Object.setPrototypeOf(this, DeploymentApiClientError.prototype);
  }
}

/**
 * Client for the Deployment Service API.
 * Handles HTTP requests, error parsing, and type safety for API interactions.
 */
export class DeploymentApiClient {
  private baseUrl: string;

  /**
   * Creates an instance of DeploymentApiClient.
   * @param baseUrl The base URL of the Deployment Service API (e.g., 'https://api.example.com/deployments').
   */
  constructor(baseUrl: string) {
    if (!baseUrl || typeof baseUrl !== 'string') {
      throw new Error('DeploymentApiClient: Base URL must be a non-empty string.');
    }
    // Ensure base URL does not end with a slash to prevent double slashes when concatenating paths
    this.baseUrl = baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl;
  }

  /**
   * Internal helper for making authenticated API requests.
   * Handles JSON parsing, error responses, and network issues.
   * @template T The expected return type of the API response.
   * @param method The HTTP method (e.g., 'GET', 'POST').
   * @param path The API endpoint path relative to the base URL (e.g., '/deployments').
   * @param data Optional request body for POST/PUT requests.
   * @returns A promise that resolves with the parsed API response.
   * @throws {DeploymentApiClientError} For API-specific errors (e.g., 4xx, 5xx responses).
   * @throws {Error} For network errors or unexpected issues.
   */
  private async request<T>(method: string, path: string, data?: object): Promise<T> {
    const url = `${this.baseUrl}${path}`;
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    };

    const config: RequestInit = {
      method,
      headers,
      body: data ? JSON.stringify(data) : undefined,
    };

    try {
      const response = await fetch(url, config);

      if (!response.ok) {
        let apiError: ApiError | undefined;
        let responseText: string | undefined;

        try {
          // Attempt to parse error as JSON
          apiError = await response.json();
        } catch (jsonError) {
          // If not JSON, get raw text
          responseText = await response.text();
        }

        const errorMessage = apiError?.message || response.statusText || `Request failed with status ${response.status}`;
        const errorDetails = apiError?.details || responseText;
        const errorCode = apiError?.errorCode;

        throw new DeploymentApiClientError(
          errorMessage,
          response.status,
          errorDetails,
          errorCode
        );
      }

      // Handle cases where response might be empty (e.g., 204 No Content)
      const text = await response.text();
      return text ? JSON.parse(text) as T : undefined as T; // Cast to T, assuming undefined is valid for empty responses if T allows it

    } catch (error) {
      if (error instanceof DeploymentApiClientError) {
        throw error; // Re-throw specific API errors
      } else if (error instanceof Error) {
        // Catch network errors or other fetch-related issues
        throw new Error(`Network request failed: ${error.message}`);
      }
      throw new Error('An unknown error occurred during API request.');
    }
  }

  /**
   * Fetches a list of all deployments.
   * @returns A promise that resolves with an array of Deployment objects.
   */
  public async getDeployments(): Promise<Deployment[]> {
    return this.request<Deployment[]>('GET', '/deployments');
  }

  /**
   * Fetches details for a specific deployment by its ID.
   * @param id The unique identifier of the deployment.
   * @returns A promise that resolves with a Deployment object.
   * @throws {Error} If the deployment ID is empty.
   */
  public async getDeploymentById(id: string): Promise<Deployment> {
    if (!id || typeof id !== 'string') {
      throw new Error('DeploymentApiClient: Deployment ID must be a non-empty string.');
    }
    return this.request<Deployment>('GET', `/deployments/${id}`);
  }

  /**
   * Triggers a new deployment.
   * @param request The deployment request payload.
   * @returns A promise that resolves with the newly created Deployment object.
   * @throws {Error} If the deployment request is invalid or missing required fields.
   */
  public async triggerDeployment(request: DeploymentRequest): Promise<Deployment> {
    // Basic input validation for required fields
    if (!request || typeof request !== 'object') {
      throw new Error('DeploymentApiClient: Invalid deployment request payload.');
    }
    if (!request.projectId || !request.environment || !request.version || !request.triggeredBy) {
      throw new Error('DeploymentApiClient: Deployment request must include projectId, environment, version, and triggeredBy.');
    }
    return this.request<Deployment>('POST', '/deployments', request);
  }

  /**
   * Fetches the health status of the Deployment Service.
   * @returns A promise that resolves with a HealthStatus object.
   */
  public async getHealth(): Promise<HealthStatus> {
    return this.request<HealthStatus>('GET', '/health');
  }
}
