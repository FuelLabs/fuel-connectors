import { seedWallet } from '@fuels/playwright-utils';
import type { BrowserContext, Page } from '@playwright/test';
import dotenv from 'dotenv';
import {
  type BNInput,
  Mnemonic,
  Provider,
  Wallet,
  type WalletUnlocked,
  bn,
} from 'fuels';
dotenv.config();

// Function to handle downloading the Fuel extension
export const getFuelExtensionPath = async () => {
  // const FUEL_WALLET_VERSION = '0.27.0'; // or whatever version you need
  // return await downloadFuel(FUEL_WALLET_VERSION);
};

export const testSetup = async () => {
  // const fuelProvider = await Provider.create(VITE_FUEL_PROVIDER_URL);
  // const masterWallet = Wallet.fromMnemonic(VITE_MASTER_WALLET_MNEMONIC);
  // masterWallet.connect(fuelProvider);
  // if (VITE_WALLET_SECRET) {
  //   await seedWallet(
  //     masterWallet.address.toString(),
  //     bn.parseUnits('100'),
  //     VITE_FUEL_PROVIDER_URL,
  //     VITE_WALLET_SECRET,
  //   );
  // }
  // const randomMnemonic = Mnemonic.generate();
  // const fuelWallet = Wallet.fromMnemonic(randomMnemonic);
  // fuelWallet.connect(fuelProvider);
  // const chainName = (await fuelProvider.fetchChain()).name;
  // const txResponse = await masterWallet.transfer(
  //   fuelWallet.address,
  //   bn(amountToFund),
  // );
  // await txResponse.waitForResult();
  // return { fuelWallet, masterWallet, fuelProvider, randomMnemonic, chainName };
};

export const transferMaxBalance = async () => {
  // if (!fromWallet || !toWallet) return;
  // const MAX_ATTEMPTS = 10;
  // const trySendMax = async (attempt = 1) => {
  //   if (attempt > MAX_ATTEMPTS) return;
  //   try {
  //     const remainingBalance = await fromWallet.getBalance();
  //     const nextSubTry = bn(attempt * 10_000);
  //     if (nextSubTry.lt(remainingBalance)) {
  //       const targetAmount = remainingBalance.sub(nextSubTry);
  //       const amountToSend = targetAmount.gt(0) ? targetAmount : bn(1);
  //       const txResponse = await fromWallet.transfer(
  //         toWallet.address,
  //         amountToSend,
  //       );
  //       await txResponse.waitForResult();
  //       console.log(
  //         `----- Success sending ${amountToSend?.format()} back to ${toWallet.address
  //         }`,
  //       );
  //     }
  //   } catch (e) {
  //     console.log('error sending remaining balance', e.message);
  //     await trySendMax(attempt + 1);
  //   }
  // };
  // await trySendMax();
};
