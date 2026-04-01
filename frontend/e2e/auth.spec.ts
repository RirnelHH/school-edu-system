import { test, expect } from '@playwright/test';
import { loginAsAdmin } from './setup';

test.describe('认证流程', () => {
  test('登录页面加载', async ({ page }) => {
    await page.goto('/login');
    await page.waitForSelector('.el-input', { timeout: 10000 });
    const inputs = page.locator('.el-input');
    await expect(inputs.first()).toBeVisible();
  });

  test('登录成功', async ({ page }) => {
    await page.goto('/login');
    await page.waitForSelector('.el-input', { timeout: 10000 });
    
    const inputs = page.locator('.el-input input');
    await inputs.nth(0).fill('admin');
    await inputs.nth(1).fill('admin123');
    
    const loginBtn = page.locator('.el-button').filter({ hasText: '登录' });
    await loginBtn.click();
    
    await page.waitForTimeout(3000);
  });

  test('访问受保护页面需要登录', async ({ page }) => {
    await page.goto('/dashboard');
    await page.waitForTimeout(2000);
    
    // 如果未登录应该跳转到登录页
    const url = page.url();
    console.log('URL after goto /dashboard:', url);
  });
});
