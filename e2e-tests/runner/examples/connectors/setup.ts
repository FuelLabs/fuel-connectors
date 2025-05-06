import { FuelWalletTestHelper, seedWallet } from '@fuels/playwright-utils';
import type { BrowserContext, Page } from '@playwright/test';
import dotenv from 'dotenv';
import {
  type BNInput,
  type ChangeTransactionRequestOutput,
  Mnemonic,
  OutputType,
  Provider,
  ScriptTransactionRequest,
  Wallet,
  type WalletUnlocked,
  bn,
} from 'fuels';
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
  const fuelProvider = new Provider(VITE_FUEL_PROVIDER_URL);
  const masterWallet = Wallet.fromMnemonic(VITE_MASTER_WALLET_MNEMONIC);
  masterWallet.connect(fuelProvider);
  if (VITE_WALLET_SECRET) {
    await seedWallet(
      masterWallet.address.toString(),
      bn.parseUnits('1'),
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

  const fuelWalletTestHelper = await FuelWalletTestHelper.walletSetup({
    context,
    fuelExtensionId: extensionId,
    fuelProvider: {
      url: fuelProvider.url,
      chainId: await fuelProvider.getChainId(),
    },
    chainName,
    mnemonic: randomMnemonic,
  });

  await page.goto('/');
  await page.bringToFront();

  return { fuelWallet, fuelWalletTestHelper, masterWallet };
};

export const fundWallet = async ({ publicKey }: { publicKey: string }) => {
  await seedWallet(
    publicKey,
    bn.parseUnits('0.1'),
    VITE_FUEL_PROVIDER_URL,
    VITE_WALLET_SECRET,
  );
};

export const transferMaxBalance = async ({
  fromWallet,
  toWallet,
}: {
  fromWallet: WalletUnlocked;
  toWallet: WalletUnlocked;
}) => {
  if (!fromWallet || !toWallet) {
    return;
  }
  const provider = fromWallet.provider;

  const {
    consensusParameters: {
      txParameters: { maxInputs },
    },
  } = await provider.getChain();

  const baseAssetId = await provider.getBaseAssetId();
  const { coins } = await fromWallet.getCoins(baseAssetId);

  if (coins.length > Number(maxInputs.toString())) {
    throw new Error('Impossible to determine maximum spendable amount');
  }

  const request = new ScriptTransactionRequest();

  request.addResources(coins);

  await request.estimateAndFund(fromWallet);

  const changeOutput = request.outputs.find(
    (output) =>
      output.type === OutputType.Change && output.assetId === baseAssetId,
  ) as ChangeTransactionRequestOutput;

  changeOutput.to = toWallet.address.toB256();

  const tx = await fromWallet.sendTransaction(request, {
    estimateTxDependencies: false,
  });

  await tx.waitForResult();
};
