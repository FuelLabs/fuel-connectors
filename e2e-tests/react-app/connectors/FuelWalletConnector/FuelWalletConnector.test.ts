import {
  downloadFuel,
  getButtonByText,
  getByAriaLabel,
} from '@fuels/playwright-utils';
import { FuelWalletTestHelper } from '@fuels/playwright-utils';
import { test } from '@fuels/playwright-utils';
import { type Page, expect } from '@playwright/test';
import dotenv from 'dotenv';
import { type WalletUnlocked, bn } from 'fuels';
import { testSetup, transferMaxBalance } from '../setup';
dotenv.config();

const fuelPathToExtension = await downloadFuel('0.21.0');
test.use({ pathToExtension: fuelPathToExtension });

const connect = async (
  page: Page,
  fuelWalletTestHelper: FuelWalletTestHelper,
) => {
  const connectButton = getButtonByText(page, 'Connect');
  await connectButton.click();
  await getByAriaLabel(page, 'Connect to Fuel Wallet', true).click();
  await fuelWalletTestHelper.walletConnect();
};

test.describe('FuelWalletConnector', () => {
  let fuelWalletTestHelper: FuelWalletTestHelper;
  let fuelWallet: WalletUnlocked;
  let masterWallet: WalletUnlocked;

  const depositAmount = '0.0003'; // Should be enough to cover the increment and transfer

  test.beforeEach(async ({ context, extensionId, page }) => {
    const { fuelProvider, chainName, randomMnemonic } = await testSetup({
      context,
      page,
      extensionId,
      amountToFund: bn.parseUnits(depositAmount),
    });

    fuelWalletTestHelper = await FuelWalletTestHelper.walletSetup(
      context,
      extensionId,
      fuelProvider.url,
      chainName,
      randomMnemonic,
    );

    await page.goto('/');
    await connect(page, fuelWalletTestHelper);
  });

  test.afterEach(async () => {
    await transferMaxBalance({
      fromWallet: fuelWallet,
      toWallet: masterWallet,
    });
  });

  test('should connect and show fuel address', async ({ page }) => {
    expect(await page.waitForSelector('text=Your Fuel Address')).toBeTruthy();
  });

  test('should connect and increment', async ({ page }) => {
    await page.click('text=Increment');
    await fuelWalletTestHelper.walletApprove();

    expect(await page.waitForSelector('text=Success')).toBeTruthy();
    expect(
      await page.waitForSelector('text=Counter Incremented!'),
    ).toBeTruthy();
  });

  test('should connect and transfer', async ({ page }) => {
    await page.click('text=Transfer 0.0001 ETH');
    await fuelWalletTestHelper.walletApprove();

    expect(await page.waitForSelector('text=Success')).toBeTruthy();
    expect(
      await page.waitForSelector('text=Transferred successfully!'),
    ).toBeTruthy();
  });

  test('should connect, disconnect, and reconnect', async ({ page }) => {
    await page.click('text=Disconnect');
    await page.waitForSelector('text=Connect Wallet');

    expect(await page.waitForSelector('text=Your Fuel Address')).toBeTruthy();
  });

  test('should connect, refresh and stay connected', async ({ page }) => {
    await page.reload();
    await page.waitForSelector('text=Your Fuel Address');
  });

  test('should connect, disconnect, refresh and stay disconnected', async ({
    page,
  }) => {
    await page.click('text=Disconnect');
    await page.waitForSelector('text=Connect Wallet');

    await page.reload();
    await page.waitForSelector('text=Connect Wallet');
  });
});
