import {
  expect,
  getButtonByText,
  getByAriaLabel,
} from '@fuels/playwright-utils';
import type { Page } from '@playwright/test';
import { testWithSynpress } from '@synthetixio/synpress';
import { sessionTests, transferTests } from '../../../common/common';
// import * as phantom from "@phantom/synpress/commands/phantom";
import phantom from '../../../node_modules/@phantom/synpress/commands/phantom';
import basicSetup from '../../../wallet-setup/basic.setup';
import { fundWallet } from '../setup';
import { test } from './setup';

phantom.confirmTransaction = async () => {
  const notificationPage =
    await phantom.playwright.switchToNotification('phantom');
  await phantom.playwright.waitAndClick(
    'phantom',
    phantom.transactionPageElements.buttons.confirmTransaction, // Ensure this locator exists or define it
    notificationPage,
    { waitForEvent: 'close' },
  );
  return true;
};

test.describe('PhantomSolanaConnector', () => {
  test.slow();

  const connect = async (page: Page) => {
    await page.goto('/');
    const connectButton = getButtonByText(page, 'Connect Wallet', true);
    await connectButton.click();
    await getByAriaLabel(page, 'Connect to Solana Wallets', true).click();

    await page.getByText('Proceed anyway').click();
    await getButtonByText(page, 'Phantom').click();

    await phantom.acceptAccess();
    await page.waitForTimeout(3000);
  };

  const approveTransfer = async () => {
    await phantom.confirmTransaction();
  };

  test('Fuel tests', async ({ page }) => {
    // await sessionTests(page, { connect, approveTransfer });

    await connect(page);

    const addressElement = await page.locator('#address');
    let address = null;
    if (addressElement) {
      address = await addressElement.getAttribute('data-address');
    }

    test.step('Check if address is not null', () => {
      expect(address).not.toBeNull();
    });

    if (address) {
      await fundWallet({ publicKey: address });
    } else {
      throw new Error('Address is null');
    }

    // wait 40 seconds
    // await page.waitForTimeout(40000);
    await transferTests(page, { connect, approveTransfer, keepSession: true });

    // await incrementTests(page, { connect, approveTransfer });
  });
});
