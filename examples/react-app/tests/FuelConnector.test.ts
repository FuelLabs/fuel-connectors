import { test } from './test';

test.describe('FuelWalletConnector', () => {
  // Connect button
  test('should render connect button', async ({ page }) => {
    await page.goto('http://localhost:5173/');
    await page.waitForSelector('text=Connect Wallet');
    await page.waitForSelector('text=Connect Wallet:enabled');

    // click connect button
    await page.click('text=Connect Wallet');

    // should see modal with Fuel Wallet button
    await page.waitForSelector('text=Fuel Wallet');
  });
});
