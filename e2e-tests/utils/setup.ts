import { FuelWalletTestHelper, seedWallet } from '@fuels/playwright-utils';
import type { BrowserContext, Page } from '@playwright/test';
import dotenv from 'dotenv';
import { type BNInput, Mnemonic, Provider, Wallet, bn } from 'fuels';
dotenv.config();

const {
  VITE_FUEL_PROVIDER_URL,
  VITE_WALLET_SECRET,
  VITE_MASTER_WALLET_MNEMONIC,
} = process.env as Record<string, string>;

export const testSetup = async ({
  context,
  extensionId,
  page,
  amountToFund,
}: {
  context: BrowserContext;
  page: Page;
  extensionId: string;
  amountToFund: BNInput;
}) => {
  const fuelProvider = await Provider.create(VITE_FUEL_PROVIDER_URL);
  const masterWallet = Wallet.fromMnemonic(VITE_MASTER_WALLET_MNEMONIC);
  masterWallet.connect(fuelProvider);
  if (VITE_WALLET_SECRET) {
    await seedWallet(
      masterWallet.address.toString(),
      bn.parseUnits('100'),
      VITE_FUEL_PROVIDER_URL,
      VITE_WALLET_SECRET,
    );
  }
  const randomMnemonic = Mnemonic.generate();
  const fuelWallet = Wallet.fromMnemonic(randomMnemonic);
  fuelWallet.connect(fuelProvider);
  const chainName = (await fuelProvider.fetchChain()).name;
  const txResponse = await masterWallet.transfer(
    fuelWallet.address,
    bn(amountToFund),
  );
  await txResponse.waitForResult();

  const fuelWalletTestHelper = await FuelWalletTestHelper.walletSetup(
    context,
    extensionId,
    fuelProvider.url,
    chainName,
    randomMnemonic,
  );

  await page.goto('/');
  await page.bringToFront();

  return { fuelWallet, fuelWalletTestHelper, masterWallet };
};
