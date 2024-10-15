import { getButtonByText, getByAriaLabel, test } from '@fuels/playwright-utils';
import { type Page, expect } from '@playwright/test';

const connectBurner = async (page: Page, walletName = 'Burner Wallet') => {
  await page.bringToFront();
  const connectButton = getButtonByText(page, 'Connect');
  await connectButton.click();
  await getByAriaLabel(page, `Connect to ${walletName}`, true).click();
};

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

  // test('should increment counter', async ({ page }) => {
  //   await connectBurner(page);

  //   await page.click('text=Increment');

  //   expect(await page.waitForSelector('text=Success')).toBeTruthy();
  //   expect(
  //     await page.waitForSelector('text=Counter Incremented!'),
  //   ).toBeTruthy();
  // });

  // test('should execute transfer', async ({ page }) => {
  //   await connectBurner(page);

  //   await page.click('text=Transfer 0.0001 ETH');

  //   expect(await page.waitForSelector('text=Success')).toBeTruthy();
  //   expect(
  //     await page.waitForSelector('text=Transferred successfully!'),
  //   ).toBeTruthy();
  // });
});
