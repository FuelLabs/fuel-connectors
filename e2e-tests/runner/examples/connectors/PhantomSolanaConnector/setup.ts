// Use a test fixture to set the context so tests have access to the wallet extension.
import { downloadFuel } from '@fuels/playwright-utils';
import type { BrowserContext } from '@playwright/test';
import { test as base, chromium } from '@playwright/test';
import phantomCommands from '../../../node_modules/@phantom/synpress/commands/phantom';
import phantomHelpers from '../../../node_modules/@phantom/synpress/helpers';

import { ETH_MNEMONIC, ETH_WALLET_PASSWORD } from './mocks';
import { getExtensionsData } from './utils/getExtensionsData';
import { waitForExtensions } from './utils/waitForExtensions';

export const test = base.extend<{
  context: BrowserContext;
  extensionId: string;
}>({
  context: async ({ context: _ }, use) => {
    // required for synpress
    global.expect = expect;
    // download fuel wallet
    // download metamask
    const phantomPath = await phantomHelpers.prepareProvider(
      'phantom',
      'latest',
    );
    // prepare browser args
    const browserArgs = [
      `--disable-extensions-except=${phantomPath}`,
      `--load-extension=${phantomPath}`,
      '--remote-debugging-port=9222',
    ];
    // launch browser
    const context = await chromium.launchPersistentContext('', {
      headless: false,
      args: browserArgs,
    });

    const extensions = await getExtensionsData(context);
    // Wait for Wallet to load
    await waitForExtensions(context, extensions);
    // Setup cynpress MetaMask

    await phantomCommands.initialSetup(chromium, {
      secretWordsOrPrivateKey: ETH_MNEMONIC,
      network: 'localhost',
      password: ETH_WALLET_PASSWORD,
      enableAdvancedSettings: true,
      enableExperimentalSettings: false,
    });
    // Set context to playwright
    await use(context);
  },
  extensionId: async ({ context }, use) => {
    let [background] = context.serviceWorkers();
    if (!background) background = await context.waitForEvent('serviceworker');
    const extensionId = background.url().split('/')[2];
    await use(extensionId);
  },
});

export const expect = test.expect;
