import { test, expect } from '@playwright/test';
import { loginAsAdmin } from './setup';

/**
 * E2E 测试 - 每日签到
 */
test.describe('每日签到', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsAdmin(page);
  });

  test('每日签到页面', async ({ page }) => {
    await page.goto('/checkin');
    await page.waitForTimeout(2000);

    await expect(page.locator('.page-title, .page-header h2').first()).toBeVisible({ timeout: 10000 });
  });

  test('签到统计页面', async ({ page }) => {
    await page.goto('/checkin/stats');
    await page.waitForTimeout(2000);

    await expect(page.locator('.page-title, .page-header h2').first()).toBeVisible({ timeout: 10000 });
  });
});
