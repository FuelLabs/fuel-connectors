import {
  downloadFuel,
  getButtonByText,
  getByAriaLabel,
} from '@fuels/playwright-utils';
import type { FuelWalletTestHelper } from '@fuels/playwright-utils';
import { test } from '@fuels/playwright-utils';
import { type Page, expect } from '@playwright/test';
import dotenv from 'dotenv';
import { type WalletUnlocked, bn } from 'fuels';
import { testSetup, transferMaxBalance } from '../setup';
dotenv.config();

const connect = async (
  page: Page,
  fuelWalletTestHelper: FuelWalletTestHelper,
) => {
  const connectButton = getButtonByText(page, 'Connect');
  await connectButton.click();
  await getByAriaLabel(page, 'Connect to Fuel Wallet', true).click();
  await fuelWalletTestHelper.walletConnect();
};

const fuelPathToExtension = await downloadFuel('0.40.1');

test.use({
  pathToExtension: fuelPathToExtension,
});

test.describe('FuelWalletConnector', () => {
  let fuelWalletTestHelper: FuelWalletTestHelper;
  let fuelWallet: WalletUnlocked;
  let masterWallet: WalletUnlocked;

  const depositAmount = '0.0003'; // Should be enough to cover the increment and transfer

  test.beforeEach(async ({ context, extensionId, page }) => {
    ({ fuelWalletTestHelper, fuelWallet, masterWallet } = await testSetup({
      context,
      page,
      extensionId,
      amountToFund: bn.parseUnits(depositAmount),
    }));

    await page.goto('/');
    await connect(page, fuelWalletTestHelper);
  });

  test.afterEach(async () => {
    await transferMaxBalance({
      fromWallet: fuelWallet,
      toWallet: masterWallet,
    });
  });

  test('FuelWallet Tests', async ({ page }) => {
    if (await page.isVisible('text=Network Switch Required')) {
      console.log('Switching network');

      await page.click('text=Switch Network');

      const walletPage = await fuelWalletTestHelper.getWalletPopupPage();

      const switchButton = getButtonByText(walletPage, 'Switch Network');
      await switchButton.click();
    }

    expect(await page.waitForSelector('text=Your Fuel Address')).toBeTruthy();

    // await test.step('should connect and increment', async () => {
    //   await page.click('text=Increment');
    //   await fuelWalletTestHelper.walletApprove();

    //   expect(await page.waitForSelector('text=Success')).toBeTruthy();
    //   expect(
    //     await page.waitForSelector('text=Counter Incremented!'),
    //   ).toBeTruthy();
    // });

    await test.step('should connect and transfer', async () => {
      await page.click('text=Transfer 0.0001 ETH');
      await fuelWalletTestHelper.walletApprove();

      expect(await page.waitForSelector('text=Success')).toBeTruthy();
      expect(
        await page.waitForSelector('text=Transferred successfully!'),
      ).toBeTruthy();
    });

    await test.step('should connect, disconnect, and reconnect', async () => {
      await page.click('text=Disconnect');
      await page.waitForSelector('text=Connect Wallet');

      await connect(page, fuelWalletTestHelper);

      expect(await page.waitForSelector('text=Your Fuel Address')).toBeTruthy();
    });

    await test.step('should connect, refresh and stay connected', async () => {
      await page.reload();
      await page.waitForSelector('text=Your Fuel Address');
    });

    await test.step('should connect, disconnect, refresh and stay disconnected', async () => {
      await page.click('text=Disconnect');
      await page.waitForSelector('text=Connect Wallet');

      await page.reload();
      await page.waitForSelector('text=Connect Wallet');
    });
  });
});
