import { getButtonByText, getByAriaLabel, test } from '@fuels/playwright-utils';
import { type Page, expect } from '@playwright/test';
import { sessionTests, skipBridgeFunds } from '../../../common/common';
import type { ConnectFunction } from '../../../common/types';

const connect: ConnectFunction = async (page: Page) => {
  await page.bringToFront();
  const connectButton = getButtonByText(page, 'Connect');
  await connectButton.click();
  await getByAriaLabel(page, 'Connect to Burner Wallet', true).click();

  await skipBridgeFunds(page);

  expect(await page.waitForSelector('text=/Your Fuel Address/')).toBeTruthy();
};

test.describe('BurnerWalletConnector', async () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.bringToFront();
  });

  test('BurnerWallet Tests', async ({ page }) => {
    await sessionTests(page, { connect, approveTransfer: async () => {} });
  });
});
