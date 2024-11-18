import {
  getButtonByText,
  getByAriaLabel,
  seedWallet,
  test,
} from '@fuels/playwright-utils';
import { type Page, expect } from '@playwright/test';
import { type BN, Provider, Wallet, bn } from 'fuels';
import {
  incrementTests,
  sessionTests,
  skipBridgeFunds,
  transferTests,
} from '../../../common/common';
import type { ConnectFunction } from '../../../common/types';
import { transferMaxBalance } from '../setup';

const { VITE_FUEL_PROVIDER_URL, VITE_WALLET_SECRET } = process.env as Record<
  string,
  string
>;

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

    const address = await addressElement.getAttribute('data-address');
    const amount: BN = bn(100_000_000);

    if (address) {
      await seedWallet(
        address,
        amount,
        VITE_FUEL_PROVIDER_URL || '',
        VITE_WALLET_SECRET || '',
      );
    } else {
      throw new Error('Address is null');
    }

    await incrementTests(page, {
      connect,
      approveTransfer: async () => {},
      keepSession: true,
    });

    await transferTests(page, {
      connect,
      approveTransfer: async () => {},
      keepSession: true,
    });

    const privateKey = await page.evaluate(() =>
      localStorage.getItem('burner-wallet-private-key'),
    );

    if (!privateKey) {
      throw new Error('Private key is null');
    }

    const burnerWallet = Wallet.fromPrivateKey(privateKey);
    const fuelProvider = await Provider.create(VITE_FUEL_PROVIDER_URL);
    burnerWallet.connect(fuelProvider);
    await transferMaxBalance({
      fromWallet: burnerWallet,
      toWallet: Wallet.fromPrivateKey(VITE_WALLET_SECRET || ''),
    });
  });
});
