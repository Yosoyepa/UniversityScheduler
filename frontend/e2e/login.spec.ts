import { test, expect } from '@playwright/test';

test('App Router redirect from unprotected root to login', async ({ page }) => {
  await page.goto('/');
  // Debería redirigirnos al login dada la protección del Middleware o los HOC
  await expect(page).toHaveURL(/.*login/);
  await expect(page.locator('h1')).toContainText('Iniciar Sesión');
});
