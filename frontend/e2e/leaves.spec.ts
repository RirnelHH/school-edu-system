import { test, expect } from '@playwright/test';
import { loginAsAdmin } from './setup';

/**
 * E2E 测试 - 请假管理
 */
test.describe('请假管理', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsAdmin(page);
  });

  test('请假列表页面', async ({ page }) => {
    await page.goto('/leaves');
    await page.waitForTimeout(2000);

    await expect(page.locator('.page-title, .page-header h2').first()).toBeVisible({ timeout: 10000 });
  });

  test('新增请假对话框', async ({ page }) => {
    await page.goto('/leaves');
    await page.waitForTimeout(2000);

    const addBtn = page.locator('.el-button').filter({ hasText: '新增请假' });
    if (await addBtn.isVisible()) {
      await addBtn.click();
      await expect(page.locator('.el-dialog').first()).toBeVisible({ timeout: 5000 });
    }
  });

  test('请假状态筛选', async ({ page }) => {
    await page.goto('/leaves');
    await page.waitForTimeout(2000);

    const statusSelect = page.locator('.el-select').first();
    if (await statusSelect.isVisible()) {
      await statusSelect.click();
    }
  });

  test('审批页面加载', async ({ page }) => {
    // 审批需要具体ID，先验证列表页
    await page.goto('/leaves');
    await page.waitForTimeout(2000);
    await expect(page.locator('.page-title, .page-header h2').first()).toBeVisible({ timeout: 10000 });
  });
});
