import type { FuelWalletTestHelper } from '@fuels/playwright-utils';
import { getButtonByText, getByAriaLabel } from '@fuels/playwright-utils';
import type { Page } from '@playwright/test';

export const connect = async (
  page: Page,
  fuelWalletTestHelper: FuelWalletTestHelper,
  walletName = 'Fuel Wallet',
) => {
  await page.bringToFront();
  const connectButton = getButtonByText(page, 'Connect');
  await connectButton.click();
  await getByAriaLabel(page, `Connect to ${walletName}`, true).click();
  await fuelWalletTestHelper.walletConnect();
};

export const connectBurner = async (
  page: Page,
  walletName = 'Burner Wallet',
) => {
  await page.bringToFront();
  const connectButton = getButtonByText(page, 'Connect');
  await connectButton.click();
  await getByAriaLabel(page, `Connect to ${walletName}`, true).click();
};
