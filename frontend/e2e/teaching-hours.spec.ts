import { test, expect } from '@playwright/test';
import { loginAsAdmin } from './setup';

/**
 * E2E 测试 - 课时统计
 */
test.describe('课时统计', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsAdmin(page);
  });

  test('课时统计列表页', async ({ page }) => {
    await page.goto('/teaching-hours');
    await page.waitForTimeout(2000);

    await expect(page.locator('.page-title, .page-header h2').first()).toBeVisible({ timeout: 10000 });
  });

  test('系数配置页面', async ({ page }) => {
    await page.goto('/teaching-hours/coefficients');
    await page.waitForTimeout(2000);

    await expect(page.locator('.page-title, .page-header h2').first()).toBeVisible({ timeout: 10000 });
  });
});
