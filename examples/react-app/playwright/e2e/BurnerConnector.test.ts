import { test } from '@fuels/playwright-utils';
import { expect } from '@playwright/test';
import { connectBurner } from './utils';

test.describe('BurnerWalletConnector', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.bringToFront();
  });

  test('should connect and show fuel address', async ({ page }) => {
    await connectBurner(page);

    expect(await page.waitForSelector('text=Your Fuel Address')).toBeTruthy();
  });

  test('should connect, disconnect, and reconnect', async ({ page }) => {
    await connectBurner(page);

    await page.click('text=Disconnect');
    await page.waitForSelector('text=Connect Wallet');

    await connectBurner(page);
    expect(await page.waitForSelector('text=Your Fuel Address')).toBeTruthy();
  });

  test('should connect, refresh and stay connected', async ({ page }) => {
    await connectBurner(page);

    await page.reload();
    await page.waitForSelector('text=Your Fuel Address');
  });

  test('should connect, disconnect, refresh and stay disconnected', async ({
    page,
  }) => {
    await connectBurner(page);

    await page.click('text=Disconnect');
    await page.waitForSelector('text=Connect Wallet');

    await page.reload();
    await page.waitForSelector('text=Connect Wallet');
  });
});
