import { test, expect } from '@playwright/test';
import { loginAsAdmin } from './setup';

/**
 * E2E 测试 - 培养计划
 */
test.describe('培养计划', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsAdmin(page);
  });

  test('培养计划列表页面', async ({ page }) => {
    await page.goto('/development-plans');
    await page.waitForTimeout(2000);

    await expect(page.locator('.page-title, .page-header h2').first()).toBeVisible({ timeout: 10000 });
  });

  test('新增培养计划对话框', async ({ page }) => {
    await page.goto('/development-plans');
    await page.waitForTimeout(2000);

    const addBtn = page.locator('.el-button').filter({ hasText: '新增' });
    if (await addBtn.isVisible()) {
      await addBtn.click();
      await expect(page.locator('.el-dialog').first()).toBeVisible({ timeout: 5000 });
    }
  });
});
