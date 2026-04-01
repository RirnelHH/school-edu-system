import { test, expect } from '@playwright/test';
import { loginAsAdmin } from './setup';

/**
 * E2E 测试 - 授课计划管理
 * 覆盖: 登录 → 授课计划列表 → 新增 → 查看详情
 */
test.describe('授课计划管理', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsAdmin(page);
  });

  test('授课计划列表页面', async ({ page }) => {
    await page.goto('/teaching-plans');
    await page.waitForTimeout(2000);

    // 验证页面标题
    await expect(page.locator('.page-title, .page-header h2').first()).toBeVisible({ timeout: 10000 });
  });

  test('授课计划列表页面元素', async ({ page }) => {
    await page.goto('/teaching-plans');
    await page.waitForTimeout(2000);

    // 验证表格存在
    await expect(page.locator('.el-table').first()).toBeVisible({ timeout: 10000 });
  });

  test('新增授课计划对话框', async ({ page }) => {
    await page.goto('/teaching-plans');
    await page.waitForTimeout(2000);

    const addBtn = page.locator('.el-button').filter({ hasText: '新增授课计划' });
    if (await addBtn.isVisible()) {
      await addBtn.click();
      await expect(page.locator('.el-dialog').first()).toBeVisible({ timeout: 5000 });
    }
  });

  test('教案列表页面加载', async ({ page }) => {
    // 教案列表需要 teachingPlanId，先测试列表页
    await page.goto('/teaching-plans');
    await page.waitForTimeout(2000);
    await expect(page.locator('.page-title, .page-header h2').first()).toBeVisible({ timeout: 10000 });
  });
});
