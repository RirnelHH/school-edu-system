import { test, expect } from '@playwright/test';
import { loginAsAdmin } from './setup';

/**
 * E2E 测试 - 成绩管理
 */
test.describe('成绩管理', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsAdmin(page);
  });

  test('成绩列表页面', async ({ page }) => {
    await page.goto('/grades');
    await page.waitForTimeout(2000);

    await expect(page.locator('.page-title, .page-header h2').first()).toBeVisible({ timeout: 10000 });
  });

  test('成绩录入页面', async ({ page }) => {
    await page.goto('/grades/entry');
    await page.waitForTimeout(2000);

    await expect(page.locator('.page-title, .page-header h2').first()).toBeVisible({ timeout: 10000 });
  });

  test('成绩审批页面', async ({ page }) => {
    // 审批需要具体ID，先验证列表页
    await page.goto('/grades');
    await page.waitForTimeout(2000);
    await expect(page.locator('.page-title, .page-header h2').first()).toBeVisible({ timeout: 10000 });
  });
});
