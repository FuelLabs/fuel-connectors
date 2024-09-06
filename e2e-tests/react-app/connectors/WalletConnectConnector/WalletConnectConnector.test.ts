import { getButtonByText, getByAriaLabel } from '@fuels/playwright-utils';
import { type Page, expect } from '@playwright/test';
// @ts-ignore
import * as metamask from '@synthetixio/synpress/commands/metamask.js';
import dotenv from 'dotenv';
import { test } from './fixtures';
dotenv.config();

const { confirmPermissionToSpend, acceptAccess } = metamask.default;

const connectToMetamask = async (page: Page) => {
  await page.bringToFront();
  await getButtonByText(page, 'Connect Wallet').click();
  const connectKitButton = getByAriaLabel(page, 'Connect to Ethereum Wallets');
  await connectKitButton.click();
  const metamaskConnect = getButtonByText(page, 'Metamask');
  await metamaskConnect.click();
  await acceptAccess();
};

test.describe('WalletConnectConnector', () => {
  test.setTimeout(120000);

  test.beforeEach(async ({ page }) => {
    await page.goto('localhost:5173');
    await connectToMetamask(page);
  });

  test('Assert complete metamask flow', async ({ page }) => {
    await test.step('Check if MetaMask is connected and showing the account', async () => {
      const account = await page.$eval('#account', (el) => el.textContent);
      expect(account).toContain('0x');
    });

    await test.step('Increment counter and confirm MetaMask permission', async () => {
      await page.click('text=Increment');
      await confirmPermissionToSpend();

      expect(await page.waitForSelector('text=Success')).toBeTruthy();
      expect(
        await page.waitForSelector('text=Counter Incremented!'),
      ).toBeTruthy();
    });

    await test.step('Transfer ETH and confirm MetaMask permission', async () => {
      await page.click('text=Transfer 0.0001 ETH');
      await confirmPermissionToSpend();

      expect(await page.waitForSelector('text=Success')).toBeTruthy();
      expect(
        await page.waitForSelector('text=Transferred successfully!'),
      ).toBeTruthy();
    });

    await test.step('Disconnect the wallet and verify', async () => {
      await page.click('text=Disconnect');
      await page.waitForSelector('text=Connect Wallet');
    });

    await test.step('Reconnect to MetaMask', async () => {
      await connectToMetamask(page);
      expect(await page.waitForSelector('text=Your Fuel Address')).toBeTruthy();
    });

    await test.step('Refresh and ensure connection persists', async () => {
      await page.reload();
      expect(await page.waitForSelector('text=Your Fuel Address')).toBeTruthy();
    });

    await test.step('Disconnect and ensure it stays disconnected', async () => {
      await page.click('text=Disconnect');
      expect(await page.waitForSelector('text=Connect Wallet')).toBeTruthy();

      await page.reload();
      expect(await page.waitForSelector('text=Connect Wallet')).toBeTruthy();
    });

    await test.step('Reconnect to MetaMask', async () => {
      await connectToMetamask(page);
      expect(await page.waitForSelector('text=Your Fuel Address')).toBeTruthy();
    });

    await test.step('Refresh and ensure connection persists', async () => {
      await page.reload();
      expect(await page.waitForSelector('text=Your Fuel Address')).toBeTruthy();
    });

    await test.step('Disconnect and ensure it stays disconnected', async () => {
      await page.click('text=Disconnect');
      expect(await page.waitForSelector('text=Connect Wallet')).toBeTruthy();

      await page.reload();
      expect(await page.waitForSelector('text=Connect Wallet')).toBeTruthy();
    });
  });
});
