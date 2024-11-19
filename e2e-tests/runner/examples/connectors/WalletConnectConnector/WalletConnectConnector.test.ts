import {
  getButtonByText,
  getByAriaLabel,
  seedWallet,
} from '@fuels/playwright-utils';
import { testWithSynpress } from '@synthetixio/synpress';
import { MetaMask, metaMaskFixtures } from '@synthetixio/synpress/playwright';
import { type BN, bn } from 'fuels';
import {
  incrementTests,
  sessionTests,
  transferTests,
} from '../../../common/common';
import type { ConnectorFunctions } from '../../../common/types';
import basicSetup from '../../../wallet-setup/basic.setup';

const test = testWithSynpress(metaMaskFixtures(basicSetup));

const { VITE_FUEL_PROVIDER_URL, VITE_WALLET_SECRET } = process.env as Record<
  string,
  string
>;

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

    const addressElement = await page.locator('css=#address');

    const address = await addressElement.getAttribute('data-address');
    const amount: BN = bn(100_000_000);

    if (address) {
      await seedWallet(
        address,
        amount,
        VITE_FUEL_PROVIDER_URL || '',
        VITE_WALLET_SECRET || '',
      );
    } else {
      throw new Error('Address is null');
    }

    await page.click('text=Disconnect');
    await page.waitForSelector('text=/Connect Wallet/');

    await transferTests(page, { connect, approveTransfer });

    await incrementTests(page, { connect, approveTransfer });
  });
});
