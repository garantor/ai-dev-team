import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    setupFiles: [], // Add setup files here if needed for global mocks/setup
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html']
    }
  },
});
