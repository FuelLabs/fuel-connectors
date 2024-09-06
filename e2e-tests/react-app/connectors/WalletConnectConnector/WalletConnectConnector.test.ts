import { getButtonByText, getByAriaLabel } from '@fuels/playwright-utils';
import { type Page, expect } from '@playwright/test';
// @ts-ignore
import * as metamask from '@synthetixio/synpress/commands/metamask.js';
import dotenv from 'dotenv';
import { test } from './fixtures';
dotenv.config();

const connectToMetamask = async (page: Page) => {
  await page.bringToFront();
  await getButtonByText(page, 'Connect Wallet').click();
  const connectKitButton = getByAriaLabel(page, 'Connect to Ethereum Wallets');
  await connectKitButton.click();
  const metamaskConnect = getButtonByText(page, 'Metamask');
  await metamaskConnect.click();

  await metamask.default.acceptAccess();
};

// const fuelPathToExtension = await downloadFuel('0.27.0');
// test.use({ pathToExtension: fuelPathToExtension });

test.describe('WalletConnectConnector', () => {
  // let fuelWalletTestHelper: FuelWalletTestHelper;
  // let fuelWallet: WalletUnlocked;
  // let masterWallet: WalletUnlocked;

  // const depositAmount = '0.0003';

  test.beforeEach(async ({ page }) => {
    // const { fuelProvider, chainName, randomMnemonic } = await testSetup({
    //   context,
    //   page,
    //   extensionId,
    //   amountToFund: bn.parseUnits(depositAmount),
    // });

    // fuelWalletTestHelper = await FuelWalletTestHelper.walletSetup(
    //   context,
    //   extensionId,
    //   fuelProvider.url,
    //   chainName,
    //   randomMnemonic,
    // );

    await page.goto('localhost:5173');
    await connectToMetamask(page);
  });

  // test.afterEach(async () => {
  //   await transferMaxBalance({
  //     fromWallet: fuelWallet,
  //     toWallet: masterWallet,
  //   });
  // });

  test('should connect and show address', async ({ page }) => {
    await test.step('Show fuel wallet address', async () => {
      // #account div code 0x
      const account = await page.$eval('#account', (el) => el.textContent);
      expect(account).toContain('0x');
    });
  });
});
