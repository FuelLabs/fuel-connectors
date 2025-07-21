import { getButtonByText, getByAriaLabel } from '@fuels/playwright-utils';
import type { Page } from '@playwright/test';
import { testWithSynpress } from '@synthetixio/synpress';
import { Phantom, phantomFixtures } from '@synthetixio/synpress/playwright';
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
import phantomSetup from '../../synpress/phantom/basic.setup';
import { fundWallet } from '../setup';

const test = testWithSynpress(phantomFixtures(phantomSetup));

test.describe('SolanaConnector', () => {
  let phantom: Phantom;
  test.slow();
  test.beforeEach(async ({ context, extensionId, phantomPage, page }) => {
    phantom = new Phantom(
      context,
      phantomPage,
      phantomSetup.walletPassword,
      extensionId,
    );
    await page.goto('/', { waitUntil: 'domcontentloaded' });
  });

  const commonConnect: ConnectFunction = async (page: Page) => {
    const connectButton = getButtonByText(page, 'Connect Wallet', true);
    await connectButton.click();
    await getByAriaLabel(page, 'Connect to Solana Wallets', true).click();
    await page.getByText('Proceed').click();
    await getButtonByText(page, 'Phantom').click();
    await phantom.connectToDapp().catch((error) => {
      // Phantom might not need to accept access if it already connected before
      console.log('Error: ', error);
    });
  };

  // First-time connection requires to confirm the fuel predicate address difference
  const connect: ConnectorFunctions['connect'] = async (page) => {
    await commonConnect(page);
    await page.getByText('Sign', { exact: true }).click();
    await phantom.confirmSignature();
    // TODO: For now we select the latest predicate version
    // In the future we may want to test all predicate version
    await page.getByText('Latest version', { exact: true }).click();
    await page.getByText('Confirm Selection', { exact: true }).click();
  };

  // From here on, we'll skip the predicate warning step
  const secondConnect: ConnectorFunctions['connect'] = async (page) => {
    await commonConnect(page);
    await page.getByText('Latest version', { exact: true }).click();
    await page.getByText('Confirm Selection', { exact: true }).click();
  };

  const approveTransfer: ApproveTransferFunction = async () => {
    await phantom.confirmSignature();
  };

  // TODO: This should be resolved by the new Reown integration
  test.skip('Solana session test', async ({ page }) => {
    await sessionTests(page, { connect, approveTransfer, secondConnect });
  });

  test('Solana transfer tests', async ({ page }) => {
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

    await transferTests(page, {
      connect: secondConnect,
      approveTransfer,
      keepSession: true,
    });
    await incrementTests(page, {
      connect: secondConnect,
      approveTransfer,
      keepSession: true,
    });
  });
});
