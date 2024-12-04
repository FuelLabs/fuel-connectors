import { getButtonByText, getByAriaLabel } from '@fuels/playwright-utils';
import { testWithSynpress } from '@synthetixio/synpress';
import { MetaMask, metaMaskFixtures } from '@synthetixio/synpress/playwright';
import {
  incrementTests,
  sessionTests,
  transferTests,
} from '../../../common/common';
import type { ConnectorFunctions } from '../../../common/types';
import basicSetup from '../../../wallet-setup/basic.setup';
import { fundWallet } from '../setup';

const test = testWithSynpress(metaMaskFixtures(basicSetup));

test.describe('WalletConnectConnector', () => {
  let metamask: MetaMask;

  test.beforeEach(async ({ context, extensionId, metamaskPage, page }) => {
    metamask = new MetaMask(
      context,
      metamaskPage,
      basicSetup.walletPassword,
      extensionId,
    );
    await page.goto('/', { waitUntil: 'domcontentloaded' });
  });

  const connect: ConnectorFunctions['connect'] = async (page) => {
    await page.goto('/');
    await page.waitForTimeout(2000);

    const connectButton = getButtonByText(page, 'Connect Wallet', true);
    await connectButton.click();
    await getByAriaLabel(page, 'Connect to Ethereum Wallets', true).click();

    await page.getByText('Proceed anyway').click();
    await getButtonByText(page, 'MetaMask', true).click();

    await metamask.connectToDapp();
    // wait 3 seconds for the connection to be established
    await page.waitForTimeout(3000);

    await metamask.confirmSignature();
  };

  const approveTransfer: ConnectorFunctions['approveTransfer'] = async () => {
    await metamask.confirmTransaction();
  };

  test('Fuel tests', async ({ page }) => {
    await sessionTests(page, { connect, approveTransfer });

    await connect(page);

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

    await incrementTests(page, { connect, approveTransfer });
  });
});
