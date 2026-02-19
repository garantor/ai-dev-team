/**
 * @file Contract tests for the DeploymentApiClient.
 * Uses Jest to mock `fetch` and verify client behavior against expected API contracts.
 */

import { DeploymentApiClient, DeploymentApiClientError } from './client';
import { Deployment, DeploymentRequest, HealthStatus, ApiError } from './types';

// Mock the global fetch function
const mockFetch = jest.fn();
global.fetch = mockFetch;

describe('DeploymentApiClient', () => {
  const baseUrl = 'http://localhost:8080/api/v1';
  let client: DeploymentApiClient;

  beforeEach(() => {
    client = new DeploymentApiClient(baseUrl);
    mockFetch.mockClear(); // Clear mocks before each test
  });

  // --- Constructor Tests ---
  it('should be instantiated with a valid base URL', () => {
    expect(() => new DeploymentApiClient(baseUrl)).not.toThrow();
    expect(client).toBeInstanceOf(DeploymentApiClient);
  });

  it('should throw an error if baseUrl is empty or invalid', () => {
    expect(() => new DeploymentApiClient('')).toThrow('DeploymentApiClient: Base URL must be a non-empty string.');
    expect(() => new DeploymentApiClient(null as any)).toThrow('DeploymentApiClient: Base URL must be a non-empty string.');
    expect(() => new DeploymentApiClient(undefined as any)).toThrow('DeploymentApiClient: Base URL must be a non-empty string.');
    expect(() => new DeploymentApiClient(123 as any)).toThrow('DeploymentApiClient: Base URL must be a non-empty string.');
  });

  // --- getDeployments Tests ---
  describe('getDeployments', () => {
    it('should return a list of deployments on success (200 OK)', async () => {
      const mockDeployments: Deployment[] = [
        { id: 'dep-1', projectId: 'backend', environment: 'staging', status: 'success', triggeredBy: 'ci-cd', startTime: '2023-10-27T10:00:00Z', version: '1.0.0' },
        { id: 'dep-2', projectId: 'frontend', environment: 'production', status: 'failed', triggeredBy: 'manual', startTime: '2023-10-27T11:00:00Z', endTime: '2023-10-27T11:05:00Z', version: '1.2.3' },
      ];
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: () => Promise.resolve(mockDeployments),
        text: () => Promise.resolve(JSON.stringify(mockDeployments)),
      });

      const deployments = await client.getDeployments();

      expect(mockFetch).toHaveBeenCalledTimes(1);
      expect(mockFetch).toHaveBeenCalledWith(`${baseUrl}/deployments`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: undefined,
      });
      expect(deployments).toEqual(mockDeployments);
      expect(deployments[0].id).toBe('dep-1');
    });

    it('should throw DeploymentApiClientError on API failure (non-2xx status)', async () => {
      const mockApiError: ApiError = { statusCode: 500, message: 'Internal Server Error', details: 'Database connection failed' };
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
        statusText: 'Internal Server Error',
        json: () => Promise.resolve(mockApiError),
        text: () => Promise.resolve(JSON.stringify(mockApiError)),
      });

      await expect(client.getDeployments()).rejects.toThrow(DeploymentApiClientError);
      await expect(client.getDeployments()).rejects.toHaveProperty('statusCode', 500);
      await expect(client.getDeployments()).rejects.toHaveProperty('message', mockApiError.message);
      await expect(client.getDeployments()).rejects.toHaveProperty('details', mockApiError.details);
    });

    it('should throw generic Error for network issues', async () => {
      mockFetch.mockRejectedValueOnce(new TypeError('Failed to fetch'));

      await expect(client.getDeployments()).rejects.toThrow('Network request failed: Failed to fetch');
    });

    it('should handle non-JSON error responses gracefully', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 404,
        statusText: 'Not Found',
        json: () => Promise.reject(new Error('Invalid JSON')), // Simulate JSON parsing failure
        text: () => Promise.resolve('<html><body><h1>404 Not Found</h1></body></html>'),
      });

      await expect(client.getDeployments()).rejects.toThrow(DeploymentApiClientError);
      await expect(client.getDeployments()).rejects.toHaveProperty('statusCode', 404);
      await expect(client.getDeployments()).rejects.toHaveProperty('message', 'Not Found');
      await expect(client.getDeployments()).rejects.toHaveProperty('details', '<html><body><h1>404 Not Found</h1></body></html>');
    });
  });

  // --- getDeploymentById Tests ---
  describe('getDeploymentById', () => {
    const deploymentId = 'dep-123';
    const mockDeployment: Deployment = { id: deploymentId, projectId: 'backend', environment: 'staging', status: 'success', triggeredBy: 'ci-cd', startTime: '2023-10-27T10:00:00Z', version: '1.0.0' };

    it('should return a single deployment on success', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: () => Promise.resolve(mockDeployment),
        text: () => Promise.resolve(JSON.stringify(mockDeployment)),
      });

      const deployment = await client.getDeploymentById(deploymentId);

      expect(mockFetch).toHaveBeenCalledWith(`${baseUrl}/deployments/${deploymentId}`, expect.any(Object));
      expect(deployment).toEqual(mockDeployment);
    });

    it('should throw DeploymentApiClientError if deployment not found (404)', async () => {
      const mockApiError: ApiError = { statusCode: 404, message: 'Deployment not found' };
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 404,
        statusText: 'Not Found',
        json: () => Promise.resolve(mockApiError),
        text: () => Promise.resolve(JSON.stringify(mockApiError)),
      });

      await expect(client.getDeploymentById('non-existent-id')).rejects.toThrow(DeploymentApiClientError);
      await expect(client.getDeploymentById('non-existent-id')).rejects.toHaveProperty('statusCode', 404);
    });

    it('should throw an error if deployment ID is empty or invalid', async () => {
      await expect(client.getDeploymentById('')).rejects.toThrow('DeploymentApiClient: Deployment ID must be a non-empty string.');
      await expect(client.getDeploymentById(null as any)).rejects.toThrow('DeploymentApiClient: Deployment ID must be a non-empty string.');
    });
  });

  // --- triggerDeployment Tests ---
  describe('triggerDeployment', () => {
    const deploymentRequest: DeploymentRequest = {
      projectId: 'backend',
      environment: 'staging',
      version: '1.0.1',
      triggeredBy: 'test-user',
      branch: 'feature/new-ci'
    };
    const mockNewDeployment: Deployment = { ...deploymentRequest, id: 'new-dep-456', status: 'pending', startTime: '2023-10-27T12:00:00Z' };

    it('should successfully trigger a deployment (201 Created)', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 201,
        json: () => Promise.resolve(mockNewDeployment),
        text: () => Promise.resolve(JSON.stringify(mockNewDeployment)),
      });

      const newDeployment = await client.triggerDeployment(deploymentRequest);

      expect(mockFetch).toHaveBeenCalledWith(`${baseUrl}/deployments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify(deploymentRequest),
      });
      expect(newDeployment).toEqual(mockNewDeployment);
    });

    it('should throw an error if deployment request is invalid', async () => {
      // Missing projectId
      const invalidRequest = { ...deploymentRequest, projectId: undefined as any };
      await expect(client.triggerDeployment(invalidRequest)).rejects.toThrow('DeploymentApiClient: Deployment request must include projectId, environment, version, and triggeredBy.');

      // Empty request
      await expect(client.triggerDeployment(null as any)).rejects.toThrow('DeploymentApiClient: Invalid deployment request payload.');
    });

    it('should throw DeploymentApiClientError on API validation failure (400 Bad Request)', async () => {
      const mockApiError: ApiError = { statusCode: 400, message: 'Invalid version format', errorCode: 'INVALID_INPUT' };
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 400,
        statusText: 'Bad Request',
        json: () => Promise.resolve(mockApiError),
        text: () => Promise.resolve(JSON.stringify(mockApiError)),
      });

      const invalidRequest = { ...deploymentRequest, version: 'abc' };
      await expect(client.triggerDeployment(invalidRequest)).rejects.toThrow(DeploymentApiClientError);
      await expect(client.triggerDeployment(invalidRequest)).rejects.toHaveProperty('statusCode', 400);
      await expect(client.triggerDeployment(invalidRequest)).rejects.toHaveProperty('errorCode', 'INVALID_INPUT');
    });
  });

  // --- getHealth Tests ---
  describe('getHealth', () => {
    const mockHealthStatus: HealthStatus = {
      status: 'ok',
      timestamp: '2023-10-27T13:00:00Z',
      message: 'All systems operational',
      services: {
        database: { status: 'ok' },
        cache: { status: 'ok' },
      },
    };

    it('should return health status on success', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: () => Promise.resolve(mockHealthStatus),
        text: () => Promise.resolve(JSON.stringify(mockHealthStatus)),
      });

      const health = await client.getHealth();

      expect(mockFetch).toHaveBeenCalledWith(`${baseUrl}/health`, expect.any(Object));
      expect(health).toEqual(mockHealthStatus);
      expect(health.status).toBe('ok');
    });

    it('should throw DeploymentApiClientError if health endpoint returns non-2xx', async () => {
      const mockApiError: ApiError = { statusCode: 503, message: 'Service Unavailable', details: 'Database connection lost' };
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 503,
        statusText: 'Service Unavailable',
        json: () => Promise.resolve(mockApiError),
        text: () => Promise.resolve(JSON.stringify(mockApiError)),
      });

      await expect(client.getHealth()).rejects.toThrow(DeploymentApiClientError);
      await expect(client.getHealth()).rejects.toHaveProperty('statusCode', 503);
      await expect(client.getHealth()).rejects.toHaveProperty('message', 'Service Unavailable');
    });
  });
});
