import {
  expect,
  getButtonByText,
  getByAriaLabel,
} from '@fuels/playwright-utils';
import type { Page } from '@playwright/test';
import phantomExtended from './phantom/phantom';
import { test } from './setup';

test.describe('SolanaConnector', () => {
  test.slow();

  const connect = async (page: Page) => {
    await page.goto('/');
    const connectButton = getButtonByText(page, 'Connect Wallet', true);
    await connectButton.click();
    await getByAriaLabel(page, 'Connect to Solana Wallets', true).click();
    await page.getByText('Proceed anyway').click();
    await getButtonByText(page, 'Phantom').click();
    await phantomExtended.acceptAccess();
    await page.waitForTimeout(3000);
  };

  test('Fuel tests', async ({ page }) => {
    await connect(page);
    const addressElement = await page.locator('#address');
    let address = null;
    if (addressElement) {
      address = await addressElement.getAttribute('data-address');
    }
    test.step('Check if address is not null', () => {
      expect(address).not.toBeNull();
    });
  });
});
