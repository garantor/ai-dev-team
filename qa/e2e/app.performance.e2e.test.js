import { describe, it, expect, beforeAll } from 'vitest';
import fetch from 'node-fetch';
import { measureAsyncPerformance } from '../utils/performance.util.js';

// Configuration for the API server
const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:3000';
const HEALTH_CHECK_ENDPOINT = '/api/health';

// Define a simulated user journey involving multiple API calls
const userJourney = async () => {
  // Step 1: Load initial data (e.g., dashboard data)
  const dashboardResponse = await fetch(`${API_BASE_URL}/api/dashboard`);
  if (!dashboardResponse.ok) throw new Error(`Dashboard load failed: ${dashboardResponse.status}`);
  await dashboardResponse.json(); // Simulate processing the response

  // Step 2: Fetch user profile data
  const profileResponse = await fetch(`${API_BASE_URL}/api/user/profile`);
  if (!profileResponse.ok) throw new Error(`Profile load failed: ${profileResponse.status}`);
  await profileResponse.json();

  // Step 3: Perform an action that triggers an update (e.g., update a setting)
  const updateResponse = await fetch(`${API_BASE_URL}/api/settings/update`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ theme: 'dark' })
  });
  if (!updateResponse.ok) throw new Error(`Settings update failed: ${updateResponse.status}`);
  await updateResponse.json();

  // Step 4: Re-fetch data to see the update (e.g., updated dashboard)
  const updatedDashboardResponse = await fetch(`${API_BASE_URL}/api/dashboard`);
  if (!updatedDashboardResponse.ok) throw new Error(`Updated dashboard load failed: ${updatedDashboardResponse.status}`);
  await updatedDashboardResponse.json();

  return 'User journey completed successfully';
};

describe('E2E Application Responsiveness Tests (API-based)', () => {
  beforeAll(async () => {
    // Basic health check to ensure the API is running before tests start
    try {
      const response = await fetch(`${API_BASE_URL}${HEALTH_CHECK_ENDPOINT}`);
      if (!response.ok) {
        throw new Error(`Health check failed: ${response.status} ${response.statusText}`);
      }
      console.log(`\n  API Health Check: ${API_BASE_URL}${HEALTH_CHECK_ENDPOINT} responded OK.`);
    } catch (error) {
      console.error(`\n  ERROR: API is not reachable at ${API_BASE_URL}. Please ensure your application is running.`);
      console.error(`  Details: ${error.message}`);
      throw error;
    }
  }, 20000); // 20 seconds timeout for health check

  it('should measure the total time for a simulated user journey', async () => {
    const { duration, result } = await measureAsyncPerformance(userJourney);

    console.log(`\n  Simulated User Journey (API-based) took: ${duration.toFixed(2)} ms`);
    console.log(`  Journey Result: ${result}`);

    expect(duration).toBeTypeOf('number');
    expect(duration).toBeGreaterThan(0); // Should take some time

    // Define an acceptable threshold for the entire user journey.
    // This threshold should be determined by business requirements and user expectations.
    const MAX_JOURNEY_TIME_MS = 1000; // Example: Entire journey should complete within 1 second

    expect(duration).toBeLessThanOrEqual(MAX_JOURNEY_TIME_MS);
  }, 30000); // 30 seconds timeout for the E2E journey test

  // You can add more E2E scenarios here, e.g., login flow, complex data submission, etc.
  // For a full browser-based E2E performance test, you would integrate with tools like Playwright or Cypress
  // and measure metrics like FCP (First Contentful Paint), LCP (Largest Contentful Paint), TBT (Total Blocking Time).
  // This current setup focuses on backend responsiveness for a sequence of API calls.
});
