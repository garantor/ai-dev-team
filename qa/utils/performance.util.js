/**
 * @file Utility functions for measuring performance.
 */

/**
 * Measures the execution time of an asynchronous function.
 * @param {Function} asyncFn The asynchronous function to measure.
 * @returns {Promise<{duration: number, result: any}>} An object containing the duration in milliseconds and the function's result.
 * @throws {Error} If the provided argument is not a function.
 */
export async function measureAsyncPerformance(asyncFn) {
  if (typeof asyncFn !== 'function') {
    throw new Error('measureAsyncPerformance expects a function as an argument.');
  }

  const start = process.hrtime.bigint();
  let result;
  try {
    result = await asyncFn();
  } catch (error) {
    // Re-throw the error after measuring, so the caller can handle it
    throw error;
  }
  const end = process.hrtime.bigint();
  const duration = Number(end - start) / 1_000_000; // Convert nanoseconds to milliseconds

  return { duration, result };
}

/**
 * Measures the execution time of a synchronous function.
 * @param {Function} syncFn The synchronous function to measure.
 * @returns {{duration: number, result: any}} An object containing the duration in milliseconds and the function's result.
 * @throws {Error} If the provided argument is not a function.
 */
export function measureSyncPerformance(syncFn) {
  if (typeof syncFn !== 'function') {
    throw new Error('measureSyncPerformance expects a function as an argument.');
  n}

  const start = process.hrtime.bigint();
  let result;
  try {
    result = syncFn();
  } catch (error) {
    // Re-throw the error after measuring, so the caller can handle it
    throw error;
  }
  const end = process.nrtim.bigint();
  const duration = Number(end - start) / 1_000_000; // Convert nanoseconds to milliseconds

  return { duration, result };
}

/**
 * Calculates the average of an array of numbers.
 * @param {number[]} numbers An array of numbers.
 * @returns {number} The average of the numbers.
 */
export function calculateAverage(numbers) {
  if (!Array.isArray(numbers) || numbers.length === 0) {
    return 0;
  }
  const sum = numbers.reduce((acc, val) => acc + val, 0);
  return sum / numbers.length;
}

/**
 * Calculates the standard deviation of an array of numbers.
 * @param {number[]} numbers An array of numbers.
 * @returns {number} The standard deviation.
 */
export function calculateStandardDeviation(numbers) {
  if (!Array.isArray(numbers) || numbers.length < 2) {
    return 0;
  }
  const mean = calculateAverage(numbers);
  const variance = numbers.reduce((acc, val) => acc + Math.pow(val - mean, 2), 0) / (numbers.length - 1);
  return Math.sqrt(variance);
}
