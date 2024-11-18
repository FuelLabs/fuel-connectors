import {
  getButtonByText,
  getByAriaLabel,
  seedWallet,
  test,
} from '@fuels/playwright-utils';
import { type Page, expect } from '@playwright/test';
import { type BN, bn } from 'fuels';
import {
  sessionTests,
  skipBridgeFunds,
  transferTests,
} from '../../../common/common';
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
    await connect(page);

    // wait 5 seconds for the wallet to load
    await page.waitForTimeout(5000);
    const addressElement = await page.locator('css=#address');
    console.log('Address element:', addressElement);

    const address = await addressElement.getAttribute('data-address');
    const amount: BN = bn(100_000_000);

    if (address) {
      await seedWallet(
        address,
        amount,
        process.env.VITE_FUEL_PROVIDER_URL || '',
        process.env.VITE_WALLET_SECRET || '',
      );
    } else {
      throw new Error('Address is null');
    }

    await transferTests(page, {
      connect,
      approveTransfer: async () => {},
      alreadyConnected: true,
    });
  });
});
