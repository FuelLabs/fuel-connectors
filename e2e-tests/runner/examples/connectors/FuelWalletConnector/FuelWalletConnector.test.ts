import {
  downloadFuel,
  getButtonByText,
  getByAriaLabel,
} from '@fuels/playwright-utils';
import type { FuelWalletTestHelper } from '@fuels/playwright-utils';
import { test } from '@fuels/playwright-utils';
import dotenv from 'dotenv';
import { type WalletUnlocked, bn } from 'fuels';
import {
  incrementTests,
  sessionTests,
  transferTests,
} from '../../../common/common';
import type { ConnectorFunctions } from '../../../common/types';
import { testSetup, transferMaxBalance } from '../setup';
dotenv.config();

const fuelPathToExtension = await downloadFuel('0.41.1');

test.use({
  pathToExtension: fuelPathToExtension,
});

test.describe('FuelWalletConnector', () => {
  let fuelWalletTestHelper: FuelWalletTestHelper;
  let fuelWallet: WalletUnlocked;
  let masterWallet: WalletUnlocked;

  const depositAmount = '0.0003'; // Should be enough to cover the increment and transfer

  const connect: ConnectorFunctions['connect'] = async (page) => {
    const connectButton = getButtonByText(page, 'Connect Wallet', true);
    await connectButton.click();
    await getByAriaLabel(page, 'Connect to Fuel Wallet', true).click();
    await fuelWalletTestHelper.walletConnect();
  };

  const approveTransfer: ConnectorFunctions['approveTransfer'] = async () => {
    await fuelWalletTestHelper.walletApprove();
  };

  test.beforeEach(async ({ context, extensionId, page }) => {
    ({ fuelWalletTestHelper, fuelWallet, masterWallet } = await testSetup({
      context,
      page,
      extensionId,
      amountToFund: bn.parseUnits(depositAmount),
    }));

    await page.goto('/');
  });

  test.afterEach(async () => {
    await transferMaxBalance({
      fromWallet: fuelWallet,
      toWallet: masterWallet,
    });
  });

  test('FuelWallet Tests', async ({ page }) => {
    if (await page.isVisible('text=Network Switch Required')) {
      await page.click('text=Switch Network');

      const walletPage = await fuelWalletTestHelper.getWalletPopupPage();

      const switchButton = getButtonByText(walletPage, 'Switch Network');
      await switchButton.click();
    }

    await sessionTests(page, { connect, approveTransfer });

    await transferTests(page, { connect, approveTransfer });

    await incrementTests(page, { connect, approveTransfer });
  });
});
