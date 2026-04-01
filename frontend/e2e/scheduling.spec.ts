import { test, expect } from '@playwright/test';
import { loginAsAdmin } from './setup';

/**
 * E2E 测试 - 排课管理
 */
test.describe('排课管理', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsAdmin(page);
  });

  test('排课列表页面', async ({ page }) => {
    await page.goto('/scheduling');
    await page.waitForTimeout(2000);

    await expect(page.locator('.page-title, .page-header h2').first()).toBeVisible({ timeout: 10000 });
  });

  test('排课编辑页面', async ({ page }) => {
    await page.goto('/scheduling/edit');
    await page.waitForTimeout(2000);

    await expect(page.locator('.page-title, .page-header h2').first()).toBeVisible({ timeout: 10000 });
  });

  test('冲突检测页面', async ({ page }) => {
    await page.goto('/scheduling/conflicts');
    await page.waitForTimeout(2000);

    await expect(page.locator('.page-title, .page-header h2').first()).toBeVisible({ timeout: 10000 });
  });
});
