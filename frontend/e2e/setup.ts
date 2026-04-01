import { test, expect, Page } from '@playwright/test';

async function loginAsAdmin(page: Page) {
  await page.goto('/login');
  await page.waitForSelector('.el-input', { timeout: 15000 });
  
  const inputs = page.locator('.el-input input');
  await inputs.nth(0).fill('admin');
  await inputs.nth(1).fill('admin123');
  
  const loginBtn = page.locator('.el-button').filter({ hasText: '登录' });
  await loginBtn.click();
  
  await page.waitForTimeout(3000);
}

/**
 * 全局 setup - 登录管理员账号
 */
export { loginAsAdmin };
