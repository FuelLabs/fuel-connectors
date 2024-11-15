import { getButtonByText, getByAriaLabel, test } from '@fuels/playwright-utils';
import { type Page, expect } from '@playwright/test';
import {
  sessionTests,
  skipBridgeFunds,
  transferTests,
} from '../../../common/common';
import type { ConnectFunction } from '../../../common/types';
import { fundWallet } from '../setup';

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

    const addressElement = await page.locator('#address');

    let address: string | null = null;

    if (addressElement) {
      address = await addressElement.getAttribute('data-address');
    }

    if (address) {
      await fundWallet({ publicKey: address });
    } else {
      throw new Error('Address is null');
    }

    await page.click('text=Disconnect');
    await page.waitForSelector('text=/Connect Wallet/');

    await transferTests(page, {
      connect,
      approveTransfer: async () => {},
    });
  });
});
