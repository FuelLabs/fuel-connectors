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
  ConnectorFunctions,
} from '../../../common/types';
import { fundWallet } from '../setup';
import phantomExtended from './phantom/phantom';
import { test } from './setup';

// @TODO: Phantom CRX is currently broken, so we're skipping this step for now
// When someone fixes it, we should move it to "ReownConnector" because SolanaConnector doesn't exist anymore
// Find this PR to see more details and understand better.
test.skip('SolanaConnector', () => {
  test.slow();

  const commonConnect: ConnectFunction = async (page: Page) => {
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

  // First-time connection requires to confirm the fuel predicate address difference
  const connect: ConnectorFunctions['connect'] = async (page) => {
    await commonConnect(page);
    await page.getByText('Continue to application').click();
  };

  // From here on, we'll skip the predicate warning step
  const secondConnect: ConnectorFunctions['connect'] = commonConnect;

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

    await secondConnect(page);
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
        connect: secondConnect,
        approveTransfer,
        keepSession: true,
      });
    });

    await test.step('Increment tests', async () => {
      await incrementTests(page, {
        connect: secondConnect,
        approveTransfer,
        keepSession: true,
      });
    });
  });
});
