/**
 * @file Type definitions for the Deployment Service API.
 * Defines the data structures for deployments, deployment requests, health status, and API errors.
 */

/**
 * Represents a single deployment record.
 */
export interface Deployment {
  id: string;
  projectId: string;
  environment: 'staging' | 'production' | 'development' | 'test';
  status: 'pending' | 'running' | 'success' | 'failed' | 'cancelled';
  triggeredBy: string;
  startTime: string; // ISO date string (e.g., '2023-10-27T10:00:00Z')
  endTime?: string; // Optional ISO date string
  version: string;
  logsUrl?: string; // Optional URL to deployment logs
  commitHash?: string; // Optional Git commit hash
  branch?: string; // Optional Git branch
}

/**
 * Represents the payload for triggering a new deployment.
 */
export interface DeploymentRequest {
  projectId: string;
  environment: 'staging' | 'production' | 'development' | 'test';
  version: string;
  triggeredBy: string; // User ID or system identifier
  commitHash?: string; // Optional Git commit hash to deploy
  branch?: string; // Optional Git branch to deploy
}

/**
 * Represents the health status of the application or service.
 */
export interface HealthStatus {
  status: 'ok' | 'degraded' | 'unavailable';
  timestamp: string; // ISO date string
  message?: string; // Overall health message
  services: {
    [key: string]: {
      status: 'ok' | 'degraded' | 'unavailable';
      message?: string;
      details?: Record<string, any>; // Additional service-specific details
    };
  };
}

/**
 * Represents a standard API error response.
 */
export interface ApiError {
  statusCode: number;
  message: string;
  details?: string;
  errorCode?: string; // Optional application-specific error code
}
