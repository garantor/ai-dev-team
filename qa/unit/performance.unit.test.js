import { describe, it, expect } from 'vitest';
import { measureSyncPerformance, measureAsyncPerformance } from '../utils/performance.util.js';

describe('Unit Performance Tests', () => {
  // --- Synchronous Function Performance ---
  it('should measure the performance of a CPU-bound synchronous function', () => {
    const N = 1000000; // Large number for a noticeable computation

    const cpuBoundFunction = (iterations) => {
      let sum = 0;
      for (let i = 0; i < iterations; i++) {
        sum += Math.sqrt(i) * Math.sin(i);
      }
      return sum;
    };

    const { duration, result } = measureSyncPerformance(() => cpuBoundFunction(N));

    console.log(`  CPU-bound function (N=${N}) took: ${duration.toFixed(2)} ms`);
    expect(duration).toBeTypeOf('number');
    expect(duration).toBeGreaterThan(0); // Should take some time
    // Set an acceptable threshold for this specific function. Adjust based on expected performance.
    expect(duration).toBeLessThan(100); // Example: Expect it to complete within 100ms
    expect(result).toBeTypeOf('number');
  });

  it('should measure the performance of a simple synchronous function', () => {
    const simpleFunction = (a, b) => a + b;

    const { duration, result } = measureSyncPerformance(() => simpleFunction(5, 10));

    console.log(`  Simple function took: ${duration.toFixed(4)} ms`);
    expect(duration).toBeTypeOf('number');
    expect(duration).toBeGreaterThanOrEqual(0); // Could be very close to 0
    expect(duration).toBeLessThan(1); // Expect it to be very fast
    expect(result).toBe(15);
  });

  // --- Asynchronous Function Performance ---
  it('should measure the performance of a simulated asynchronous operation', async () => {
    const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));
    const expectedDelay = 50; // ms

    const asyncOperation = async () => {
      await delay(expectedDelay);
      return 'data';
    };

    const { duration, result } = await measureAsyncPerformance(asyncOperation);

    console.log(`  Simulated async operation (delay=${expectedDelay}ms) took: ${duration.toFixed(2)} ms`);
    expect(duration).toBeTypeOf('number');
    expect(duration).toBeGreaterThanOrEqual(expectedDelay * 0.9); // Allow for some variance
    expect(duration).toBeLessThan(expectedDelay * 1.5); // Should not be excessively slow
    expect(result).toBe('data');
  });

  it('should handle errors in measured functions gracefully', async () => {
    const failingFunction = async () => {
      throw new Error('Test error');
    };

    await expect(measureAsyncPerformance(failingFunction)).rejects.toThrow('Test error');
  });
});
