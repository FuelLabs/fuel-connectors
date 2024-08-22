import { downloadFuel } from '@fuels/playwright-utils';
import { test } from '@fuels/playwright-utils';
import { expect } from '@playwright/test';
import { connectBurner } from './utils';

const fuelPathToExtension = await downloadFuel('0.21.0');
test.use({ pathToExtension: fuelPathToExtension });

test.describe('BurnerWalletConnector', () => {
  test('should connect and show fuel address', async ({ page }) => {
    await connectBurner(page);

    expect(await page.waitForSelector('text=Your Fuel Address')).toBeTruthy();
  });
});
