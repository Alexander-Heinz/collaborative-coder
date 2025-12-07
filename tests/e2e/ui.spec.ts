import { test, expect, Page } from '@playwright/test';

// Helper functions
async function waitForConnection(page: Page) {
  await page.waitForSelector('text=Connected', { timeout: 10000 });
}

async function typeInEditor(page: Page, text: string) {
  const editor = page.locator('.monaco-editor textarea');
  await editor.focus();
  await editor.fill('');
  await page.keyboard.type(text, { delay: 30 });
}

async function selectLanguage(page: Page, language: string) {
  await page.hover('[data-testid="language-selector"]');
  await page.waitForTimeout(300);
  await page.click(`text=${language}`);
}

test.describe('CodeSync UI Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('Homepage loads correctly', async ({ page }) => {
    // Check main elements are present
    await expect(page.locator('text=CodeSync')).toBeVisible();
    await expect(page.locator('[data-testid="run-button"]')).toBeVisible();
    await expect(page.locator('[data-testid="share-button"]')).toBeVisible();
    
    // Monaco editor should load
    await expect(page.locator('.monaco-editor')).toBeVisible({ timeout: 10000 });
  });

  test('Language selector works', async ({ page }) => {
    // Open language dropdown
    await page.hover('[data-testid="language-selector"]');
    await page.waitForTimeout(300);
    
    // Select Python
    await page.click('text=Python');
    
    // Verify Python is selected
    await expect(page.locator('[data-testid="language-selector"]')).toContainText('Python');
  });

  test('Run button executes code', async ({ page }) => {
    await page.waitForSelector('.monaco-editor');
    
    // Click run
    await page.click('[data-testid="run-button"]');
    
    // Output panel should show something
    await page.waitForTimeout(1000);
    const output = page.locator('[data-testid="output-panel"]');
    await expect(output).toBeVisible();
  });

  test('Share button copies link', async ({ page }) => {
    // Grant clipboard permissions
    await page.context().grantPermissions(['clipboard-read', 'clipboard-write']);
    
    // Click share
    await page.click('[data-testid="share-button"]');
    
    // Should show toast notification
    await expect(page.locator('text=Link copied')).toBeVisible({ timeout: 5000 });
  });

  test('Output panel can be cleared', async ({ page }) => {
    // Run some code first
    await page.click('[data-testid="run-button"]');
    await page.waitForTimeout(1000);
    
    // Clear output
    await page.click('[data-testid="clear-output"]');
    
    // Output should be empty or show placeholder
    const output = page.locator('[data-testid="output-panel"]');
    await expect(output).toContainText('Run your code');
  });

  test('Responsive layout works on mobile', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    
    // Editor should still be visible
    await expect(page.locator('.monaco-editor')).toBeVisible({ timeout: 10000 });
    
    // Toolbar should adapt
    await expect(page.locator('[data-testid="run-button"]')).toBeVisible();
  });

  test('Status bar shows connection status', async ({ page }) => {
    await waitForConnection(page);
    
    // Status bar should show connected
    await expect(page.locator('text=Connected')).toBeVisible();
  });

  test('User count displays correctly', async ({ page }) => {
    await waitForConnection(page);
    
    // Should show at least 1 user (self)
    const userCount = page.locator('text=/\\d+ online/');
    await expect(userCount).toBeVisible();
  });
});
