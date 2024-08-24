import { downloadFuel } from '@fuels/playwright-utils';
import type { FuelWalletTestHelper } from '@fuels/playwright-utils';
import { test } from '@fuels/playwright-utils';
import { expect } from '@playwright/test';
import type { WalletUnlocked } from 'fuels';
import { bn, toBech32 } from 'fuels';
import { testSetup } from '../utils/index.js';
import { connect } from './utils';

const fuelPathToExtension = await downloadFuel('0.21.0');
test.use({ pathToExtension: fuelPathToExtension });

test.describe('FuelWalletConnector', () => {
  let fuelWalletTestHelper: FuelWalletTestHelper;

  const depositAmount = '0.00000001';

  test.beforeEach(async ({ context, extensionId, page }) => {
    ({ fuelWalletTestHelper } = await testSetup({
      context,
      page,
      extensionId,
      amountToFund: bn.parseUnits(depositAmount).mul(2),
    }));
  });

  test('should render connect button and handle new tab', async ({ page }) => {
    await connect(page, fuelWalletTestHelper);
    expect(await page.waitForSelector('text=Your Fuel Address')).toBeTruthy();
  });
});
