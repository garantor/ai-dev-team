import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'node',
    // Optional: if you have global setup for tests (e.g., loading dotenv)
    // setupFiles: ['./tests/setup.js'],
  },
});