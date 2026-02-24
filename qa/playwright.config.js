import { defineConfig, devices } from '@playwright/test';
import dotenv from 'dotenv';

dotenv.config({ path: './qa/.env' });

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  use: {
    baseURL: process.env.APP_BASE_URL || 'http://localhost:8080',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'on-first-retry',
    headless: process.env.CI ? true : false,
    // Context options
    viewport: { width: 1280, height: 720 },
    ignoreHTTPSErrors: true,
  },

  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },
    {
      name: 'Mobile Chrome',
      use: { ...devices['Pixel 5'] },
    },
    {
      name: 'Mobile Safari',
      use: { ...devices['iPhone 12'] },
    },
    // Add more devices/browsers as needed for cross-device testing
    // Example for a specific tablet:
    // {
    //   name: 'iPad Pro',
    //   use: { ...devices['iPad Pro'] },
    // },
  ],

  webServer: {
    command: 'npm run start:frontend', // Command to start your frontend app
    url: process.env.APP_BASE_URL || 'http://localhost:8080',
    reuseExistingServer: !process.env.CI,
    timeout: 60 * 1000,
  },
});