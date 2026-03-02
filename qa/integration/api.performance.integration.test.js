import { describe, it, expect, beforeAll } from 'vitest';
import fetch from 'node-fetch';
import { measureAsyncPerformance, calculateAverage, calculateStandardDeviation } from '../utils/performance.util.js';

// Configuration for the API server
const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:3000';
const TEST_ENDPOINT = '/api/data'; // A hypothetical endpoint that returns some data
const HEALTH_CHECK_ENDPOINT = '/api/health'; // A simple health check endpoint
const CONCURRENT_REQUESTS = 10; // Number of concurrent requests to simulate load
const ITERATIONS = 50; // Number of times to repeat the test for averaging

describe('API Latency Integration Tests', () => {
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
      // Vitest will fail the suite if an error is thrown in beforeAll
      throw error;
    }
  }, 20000); // 20 seconds timeout for health check

  it(`should measure average latency for ${TEST_ENDPOINT} under typical load (${CONCURRENT_REQUESTS} concurrent requests)`, async () => {
    const latencies = [];

    for (let i = 0; i < ITERATIONS; i++) {
      const requests = Array.from({ length: CONCURRENT_REQUESTS }, () =>
        measureAsyncPerformance(async () => {
          const response = await fetch(`${API_BASE_URL}${TEST_ENDPOINT}`);
          if (!response.ok) {
            throw new Error(`API call failed: ${response.status} ${response.statusText} for ${TEST_ENDPOINT}`);
          }
          return response.json(); // Or response.text() if not JSON
        })
      );

      const results = await Promise.allSettled(requests);

      results.forEach(result => {
        if (result.status === 'fulfilled') {
          latencies.push(result.value.duration);
        } else {
          console.error(`  Request failed: ${result.reason.message}`);
          // Optionally, throw an error to fail the test if any request fails
          // throw result.reason;
        }
      });
    }

    expect(latencies.length).toBeGreaterThan(0); // Ensure some successful requests

    const averageLatency = calculateAverage(latencies);
    const stdDevLatency = calculateStandardDeviation(latencies);

    console.log(`\n  API Latency for ${TEST_ENDPOINT} (${CONCURRENT_REQUESTS} concurrent requests, ${ITERATIONS} iterations):`);
    console.log(`    Average: ${averageLatency.toFixed(2)} ms`);
    console.log(`    Standard Deviation: ${stdDevLatency.toFixed(2)} ms`);
    console.log(`    Min: ${Math.min(...latencies).toFixed(2)} ms`);
    console.log(`    Max: ${Math.max(...latencies).toFixed(2)} ms`);

    // Define performance thresholds (adjust these based on your application's requirements)
    const MAX_AVERAGE_LATENCY_MS = 200; // Example: Average latency should be under 200ms
    const MAX_STD_DEV_LATENCY_MS = 50;  // Example: Standard deviation should be under 50ms for consistency

    expect(averageLatency).toBeLessThanOrEqual(MAX_AVERAGE_LATENCY_MS);
    expect(stdDevLatency).toBeLessThanOrEqual(MAX_STD_DEV_LATENCY_MS);
  }, 60000); // 60 seconds timeout for this potentially long test

  it('should measure latency for a single API call to a simple endpoint', async () => {
    const { duration } = await measureAsyncPerformance(async () => {
      const response = await fetch(`${API_BASE_URL}${HEALTH_CHECK_ENDPOINT}`);
      if (!response.ok) {
        throw new Error(`API call failed: ${response.status} ${response.statusText} for ${HEALTH_CHECK_ENDPOINT}`);
      }
      return response.text();
    });

    console.log(`  Single API call to ${HEALTH_CHECK_ENDPOINT} took: ${duration.toFixed(2)} ms`);

    const MAX_SINGLE_CALL_LATENCY_MS = 50; // Example: Simple endpoint should respond very quickly
    expect(duration).toBeLessThanOrEqual(MAX_SINGLE_CALL_LATENCY_MS);
  });
});
