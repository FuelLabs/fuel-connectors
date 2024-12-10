import { test } from '@fuels/playwright-utils';
import { type Page, expect } from '@playwright/test';
import type { ConnectorFunctions } from './types';

// biome-ignore lint/suspicious/noExportsInTest: <explanation>
export const skipBridgeFunds = async (page: Page) => {
  await page.waitForTimeout(1000);
  if (await page.isVisible('text=Bridge Funds', { timeout: 2000 })) {
    await page.click('text=Continue to application');
  }
};

// biome-ignore lint/suspicious/noExportsInTest: <explanation>
export const sessionTests = async (
  page: Page,
  { connect, secondConnect = connect }: ConnectorFunctions,
) => {
  await connect(page);

  await test.step('should connect, disconnect, and reconnect', async () => {
    await skipBridgeFunds(page);

    await page.click('text=Disconnect');
    await page.waitForSelector('text=/Connect Wallet/');

    await secondConnect(page);
    await skipBridgeFunds(page);

    expect(await page.waitForSelector('text=/Your Fuel Address/')).toBeTruthy();
  });

  await test.step('should refresh and stay connected', async () => {
    await page.reload();
    await skipBridgeFunds(page);
    await page.waitForSelector('text=/Your Fuel Address/');
  });

  await test.step('should disconnect, refresh and stay disconnected', async () => {
    await skipBridgeFunds(page);
    await page.click('text=Disconnect');
    await page.waitForSelector('text=/Connect Wallet/');

    await page.reload();
    await page.waitForSelector('text=/Connect Wallet/');
  });
};

// biome-ignore lint/suspicious/noExportsInTest: <explanation>
export const transferTests = async (
  page: Page,
  { connect, approveTransfer, keepSession }: ConnectorFunctions,
) => {
  !keepSession && (await connect(page));

  await page.click('text=Transfer 0.0001 ETH');
  await approveTransfer(page);

  expect(
    await page.waitForSelector('text=Transferred successfully!'),
  ).toBeTruthy();

  !keepSession && (await page.click('text=Disconnect'));
};

// biome-ignore lint/suspicious/noExportsInTest: <explanation>
export const incrementTests = async (
  page: Page,
  { approveTransfer, connect, keepSession }: ConnectorFunctions,
) => {
  await test.step('should connect and increment', async () => {
    !keepSession && (await connect(page));

    const incrementButton = await page.getByRole('button', {
      name: 'Increment',
    });
    await incrementButton.click();

    await approveTransfer(page);

    expect(await page.waitForSelector('text=Success')).toBeTruthy();
    expect(
      await page.waitForSelector('text=Counter Incremented!'),
    ).toBeTruthy();

    !keepSession && (await page.click('text=Disconnect'));
  });
};
