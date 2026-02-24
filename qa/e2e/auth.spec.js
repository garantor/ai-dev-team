import { test, expect } from '@playwright/test';
import { getTestUser } from '../utils/testData';

test.describe('E2E: User Authentication', () => {
  let user;

  test.beforeEach(async ({ page }) => {
    user = getTestUser();
    await page.goto('/'); // Navigate to the base URL (e.g., login/registration page)
  });

  test('should allow a user to register, login, and logout successfully', async ({ page, browserName }) => {
    console.log(`Running on ${browserName}`);

    // 1. Navigate to Registration (assuming a link or direct path)
    await page.getByTestId('nav-register').click();
    await expect(page).toHaveURL(/.*register/);

    // 2. Fill registration form
    await page.getByTestId('register-email-input').fill(user.email);
    await page.getByTestId('register-username-input').fill(user.username);
    await page.getByTestId('register-password-input').fill(user.password);
    await page.getByTestId('register-confirm-password-input').fill(user.password);
    await page.getByTestId('register-submit-button').click();

    // 3. Verify successful registration and redirection to login/dashboard
    await expect(page).toHaveURL(/.*login|.*dashboard/);
    await expect(page.getByTestId('success-message')).toContainText('Registration successful');
    console.log(`User ${user.email} registered successfully.`);

    // If redirected to login, perform login
    if (page.url().includes('login')) {
      await page.getByTestId('login-email-input').fill(user.email);
      await page.getByTestId('login-password-input').fill(user.password);
      await page.getByTestId('login-submit-button').click();
      await expect(page).toHaveURL(/.*dashboard/);
      await expect(page.getByTestId('welcome-message')).toContainText(`Welcome, ${user.username}`);
      console.log(`User ${user.email} logged in successfully.`);
    } else {
      // Assuming direct login after registration
      await expect(page.getByTestId('welcome-message')).toContainText(`Welcome, ${user.username}`);
    }

    // 4. User Logout
    await page.getByTestId('nav-logout').click();
    await expect(page).toHaveURL(/.*login/);
    await expect(page.getByTestId('success-message')).toContainText('Logged out successfully');
    console.log(`User ${user.email} logged out successfully.`);

    // 5. Verify unauthorized access after logout (e.g., trying to access dashboard)
    await page.goto('/dashboard'); // Attempt to go to a protected route
    await expect(page).toHaveURL(/.*login/); // Should be redirected to login
    await expect(page.getByTestId('error-message')).toContainText('Please log in');
    console.log(`Verified unauthorized access after logout.`);
  });

  test('should display error for invalid login credentials', async ({ page, browserName }) => {
    console.log(`Running on ${browserName}`);

    // Assuming we are on the login page initially or navigate to it
    await page.getByTestId('nav-login').click();
    await expect(page).toHaveURL(/.*login/);

    await page.getByTestId('login-email-input').fill('nonexistent@example.com');
    await page.getByTestId('login-password-input').fill('wrongpassword');
    await page.getByTestId('login-submit-button').click();

    await expect(page.getByTestId('error-message')).toContainText('Invalid credentials');
    await expect(page).toHaveURL(/.*login/); // Should remain on login page
    console.log(`Verified error for invalid login.`);
  });

  test('should display error for missing registration fields', async ({ page, browserName }) => {
    console.log(`Running on ${browserName}`);

    await page.getByTestId('nav-register').click();
    await expect(page).toHaveURL(/.*register/);

    // Attempt to register with only email
    await page.getByTestId('register-email-input').fill('partial@example.com');
    await page.getByTestId('register-submit-button').click();

    await expect(page.getByTestId('error-message')).toContainText('Password is required');
    await expect(page.getByTestId('error-message')).toContainText('Username is required');
    await expect(page).toHaveURL(/.*register/);
    console.log(`Verified error for missing registration fields.`);
  });
});