import { test, expect } from '@playwright/test';

test.describe('认证流程', () => {
  test('登录页面加载', async ({ page }) => {
    await page.goto('/login');
    await page.waitForSelector('.el-input', { timeout: 10000 });
    const inputs = page.locator('.el-input');
    await expect(inputs.first()).toBeVisible();
  });

  test('登录表单验证', async ({ page }) => {
    await page.goto('/login');
    await page.waitForSelector('.el-button', { timeout: 10000 });
    const submitBtn = page.locator('.el-button').first();
    if (await submitBtn.isVisible()) {
      await submitBtn.click();
    }
  });

  test('错误的登录尝试', async ({ page }) => {
    await page.goto('/login');
    await page.waitForSelector('.el-input', { timeout: 10000 });
    
    // 找到用户名和密码输入框
    const inputs = page.locator('.el-input input');
    await inputs.nth(0).fill('wronguser');
    await inputs.nth(1).fill('wrongpass');
    
    // 点击登录按钮
    await page.locator('.el-button').filter({ hasText: '登录' }).click();
    
    // 等待一下
    await page.waitForTimeout(500);
  });
});

test.describe('首页', () => {
  test('首页加载', async ({ page }) => {
    await page.goto('/');
    await page.waitForTimeout(1000);
    await expect(page).toHaveTitle(/./);
  });
});
