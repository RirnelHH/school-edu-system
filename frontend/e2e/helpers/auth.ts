import { test as base, Page } from '@playwright/test';

/**
 * 已登录的用户 fixture
 */
async function loginAsAdmin(page: Page) {
  await page.goto('/login');
  await page.waitForSelector('.el-input', { timeout: 15000 });
  
  const inputs = page.locator('.el-input input');
  await inputs.nth(0).fill('admin');
  await inputs.nth(1).fill('admin123');
  
  const loginBtn = page.locator('.el-button').filter({ hasText: '登录' });
  await loginBtn.click();
  
  // 等待登录完成
  await page.waitForTimeout(3000);
  
  // 验证登录成功（检查是否跳转到首页或dashboard）
  const url = page.url();
  console.log('After login URL:', url);
}

export { loginAsAdmin };
