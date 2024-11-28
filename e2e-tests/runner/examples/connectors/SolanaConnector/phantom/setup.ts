import type { BrowserContext } from '@playwright/test';
import { chromium } from '@playwright/test';
import phantomHelpers from '../../../../node_modules/@phantom/synpress/helpers';
import { PHANTOM_CONFIG } from './config';
import phantomExtended from './phantom';

export async function phantomPath() {
  return await phantomHelpers.prepareProvider('phantom', 'latest');
}
export async function setupPhantom(_context: BrowserContext) {
  await phantomExtended.initialSetup(chromium, {
    secretWordsOrPrivateKey: PHANTOM_CONFIG.MNEMONIC,
    network: 'localhost',
    password: PHANTOM_CONFIG.WALLET_PASSWORD,
    enableAdvancedSettings: true,
    enableExperimentalSettings: false,
  });
}
