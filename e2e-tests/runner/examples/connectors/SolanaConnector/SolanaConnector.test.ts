import {
  expect,
  getButtonByText,
  getByAriaLabel,
} from '@fuels/playwright-utils';
import type { Page } from '@playwright/test';
import {
  sessionTests,
  skipBridgeFunds,
  transferTests,
} from '../../../common/common';
import type {
  ApproveTransferFunction,
  ConnectFunction,
} from '../../../common/types';
import { fundWallet } from '../setup';
import phantomExtended from './phantom/phantom';
import { test } from './setup';

test.describe('SolanaConnector', () => {
  test.slow();

  const connect: ConnectFunction = async (page: Page) => {
    const connectButton = getButtonByText(page, 'Connect Wallet', true);
    await connectButton.click();
    await getByAriaLabel(page, 'Connect to Solana Wallets', true).click();
    await page.getByText('Proceed anyway').click();
    await getButtonByText(page, 'Phantom').click();
    try {
      await phantomExtended.acceptAccess();
    } catch (error) {
      // Phantom might not need to accept access if it already connected before
      console.log('Error: ', error);
    }
  };

  const approveTransfer: ApproveTransferFunction = async () => {
    await phantomExtended.confirmSignatureRequest();
  };

  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('Solana tests', async ({ page }) => {
    await sessionTests(page, { connect, approveTransfer });
    await connect(page);

    await skipBridgeFunds(page);

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
    await transferTests(page, { connect, approveTransfer });
  });
});
