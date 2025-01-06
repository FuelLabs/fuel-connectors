import { getButtonByText, getByAriaLabel } from '@fuels/playwright-utils';
import type { Page } from '@playwright/test';
import {
  incrementTests,
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

// @TODO: Phantom CRX is currently broken, so we're skipping this step for now
test.skip('SolanaConnector', () => {
  test.slow();

  const connect: ConnectFunction = async (page: Page) => {
    const connectButton = getButtonByText(page, 'Connect Wallet', true);
    await connectButton.click();
    await getByAriaLabel(page, 'Connect to Solana Wallets', true).click();
    await page.getByText('Proceed').click();
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
    await test.step('Session tests', async () => {
      await sessionTests(page, { connect, approveTransfer });
    });

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
    await test.step('Transfer tests', async () => {
      await transferTests(page, {
        connect,
        approveTransfer,
        keepSession: true,
      });
    });

    await test.step('Increment tests', async () => {
      await incrementTests(page, {
        connect,
        approveTransfer,
        keepSession: true,
      });
    });
  });
});
