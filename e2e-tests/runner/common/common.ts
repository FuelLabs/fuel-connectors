import { test } from '@fuels/playwright-utils';
import { type Page, expect } from '@playwright/test';
import type { ApproveTransferFunction, ConnectorFunctions } from './types';

// biome-ignore lint/suspicious/noExportsInTest: <explanation>
export const skipBridgeFunds = async (page: Page) => {
  if (await page.isVisible('text=Bridge Funds', { timeout: 2000 })) {
    await page.click('text=Continue to application');
  }
};

// biome-ignore lint/suspicious/noExportsInTest: <explanation>
export const sessionTests = async (
  page: Page,
  { connect }: ConnectorFunctions,
) => {
  await connect(page);

  await test.step('should connect, disconnect, and reconnect', async () => {
    await skipBridgeFunds(page);

    await page.click('text=Disconnect');
    await page.waitForSelector('text=/Connect Wallet/');

    await connect(page);
    await skipBridgeFunds(page);

    expect(await page.waitForSelector('text=/Your Fuel Address/')).toBeTruthy();
  });

  await test.step('should connect, refresh and stay connected', async () => {
    await page.reload();
    await skipBridgeFunds(page);
    await page.waitForSelector('text=/Your Fuel Address/');
  });

  await test.step('should connect, disconnect, refresh and stay disconnected', async () => {
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
  { connect, approveTransfer }: ConnectorFunctions,
) => {
  await connect(page);

  await page.click('text=Transfer 0.0001 ETH');
  await approveTransfer(page);

  expect(
    await page.waitForSelector('text=Transferred successfully!'),
  ).toBeTruthy();
};

// biome-ignore lint/suspicious/noExportsInTest: <explanation>
export const incrementTests = async (
  page: Page,
  { approveTransfer }: ConnectorFunctions,
) => {
  await test.step('should connect and increment', async () => {
    await page.click('text=Increment');
    await approveTransfer(page);

    expect(await page.waitForSelector('text=Success')).toBeTruthy();
    expect(
      await page.waitForSelector('text=Counter Incremented!'),
    ).toBeTruthy();
  });
};
