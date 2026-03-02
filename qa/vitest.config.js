import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    // Configure test environment if needed, e.g., 'node' or 'jsdom'
    environment: 'node',
    // Set a global timeout for all tests (in milliseconds)
    // This is important for performance tests that might take longer
    testTimeout: 30000, // 30 seconds
    hookTimeout: 10000, // 10 seconds for before/after hooks
    // Exclude certain files from being treated as tests
    exclude: ['node_modules', 'dist', '.idea', '.git', '.cache', '**/utils/**'],
    // Include specific directories for tests
    include: ['qa/**/*.test.js'],
    // Report performance metrics if tests exceed a certain time
    // This is more for test execution time, not app performance
    slowTestThreshold: 5000, // Warn if a test takes longer than 5 seconds
    // Enable coverage if desired
    // coverage: {
    //   provider: 'v8',
    //   reporter: ['text', 'json', 'html'],
    //   exclude: ['qa/utils/**']
    // }
  },
});
