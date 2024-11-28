import type { BrowserContext } from '@playwright/test';
import { test as base, chromium } from '@playwright/test';
import { phantomPath, setupPhantom } from './phantom';

import { getExtensionsData } from './utils/getExtensionsData';
import { waitForExtensions } from './utils/waitForExtensions';

export const test = base.extend<{
  context: BrowserContext;
  extensionId: string;
}>({
  context: async ({ context: _ }, use) => {
    global.expect = expect;
    const path = await phantomPath();
    const browserArgs = [
      `--disable-extensions-except=${path}`,
      `--load-extension=${path}`,
      '--remote-debugging-port=9222',
    ];
    const context = await chromium.launchPersistentContext('', {
      headless: false,
      args: browserArgs,
    });
    const extensions = await getExtensionsData(context);
    await waitForExtensions(context, extensions);
    await setupPhantom();
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
