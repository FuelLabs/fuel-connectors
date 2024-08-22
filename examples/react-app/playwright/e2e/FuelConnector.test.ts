import { downloadFuel } from '@fuels/playwright-utils';
import type { FuelWalletTestHelper } from '@fuels/playwright-utils';
import { test } from '@fuels/playwright-utils';
import { expect } from '@playwright/test';
import { bn } from 'fuels';
import { testSetup } from '../utils/index.js';
import { connect } from './utils';

const fuelPathToExtension = await downloadFuel('0.21.0');
test.use({ pathToExtension: fuelPathToExtension });

test.describe('FuelWalletConnector', () => {
  let fuelWalletTestHelper: FuelWalletTestHelper;

  const depositAmount = '0.0003'; // Should be enough to cover the increment and transfer

  test.beforeEach(async ({ context, extensionId, page }) => {
    ({ fuelWalletTestHelper } = await testSetup({
      context,
      page,
      extensionId,
      amountToFund: bn.parseUnits(depositAmount),
    }));
  });

  test('should connect and show fuel address', async ({ page }) => {
    await connect(page, fuelWalletTestHelper);
    expect(await page.waitForSelector('text=Your Fuel Address')).toBeTruthy();
  });

  test('should connect and increment', async ({ page }) => {
    await connect(page, fuelWalletTestHelper);

    await page.click('text=Increment');
    await fuelWalletTestHelper.walletApprove();

    expect(await page.waitForSelector('text=Success')).toBeTruthy();
    expect(
      await page.waitForSelector('text=Counter Incremented!'),
    ).toBeTruthy();
  });

  test('should connect and transfer', async ({ page }) => {
    await connect(page, fuelWalletTestHelper);

    await page.click('text=Transfer 0.0001 ETH');
    await fuelWalletTestHelper.walletApprove();

    expect(await page.waitForSelector('text=Success')).toBeTruthy();
    expect(
      await page.waitForSelector('text=Transferred successfully!'),
    ).toBeTruthy();
  });
});
