import { type Provider, bn } from 'fuels';

import { getAccount } from '@wagmi/core';
import { createWeb3Modal } from '@web3modal/wagmi';
import { DEFAULT_PROJECT_ID } from '../constants';
import { type Predicate, WalletConnectConnector } from '../index';
import { PredicateAccount } from '../utils/Predicate';
import { createWagmiConfig } from '../utils/wagmiConfig';
import { VERSIONS } from './mocked-versions/versions-dictionary';

export class testWalletConnectConnector extends WalletConnectConnector {
  constructor(fuelProvider: Provider) {
    const wagmiConfig = createWagmiConfig();
    const web3Modal = createWeb3Modal({
      wagmiConfig: {
        ...wagmiConfig,
        // @ts-ignore
        enableWalletConnect: !!projectId,
      },
      enableAnalytics: false,
      allowUnsupportedChain: true,
      projectId: DEFAULT_PROJECT_ID,
    });
    super({ wagmiConfig, web3Modal });
    this.fuelProvider = fuelProvider;
  }

  async getProviders() {
    if (this.fuelProvider) {
      return { fuelProvider: this.fuelProvider };
    }
    throw 'Providers must exists';
  }

  async setupPredicate(): Promise<PredicateAccount> {
    if (this.customPredicate?.abi && this.customPredicate?.bytecode) {
      this.predicateAccount = new PredicateAccount(this.customPredicate);
      this.predicateAddress = 'custom';

      return this.predicateAccount;
    }

    const predicateVersions = Object.entries(VERSIONS).map(([key, pred]) => ({
      pred,
      key,
    }));

    let predicateWithBalance: Predicate | null = null;

    for (const predicateVersion of predicateVersions) {
      const predicateInstance = new PredicateAccount({
        abi: predicateVersion.pred.predicate.abi,
        bytecode: predicateVersion.pred.predicate.bytecode,
      });

      const account = getAccount(this.wagmiConfig);
      const address = account.address;

      if (!address) {
        continue;
      }

      const { fuelProvider } = await this.getProviders();
      const predicate = predicateInstance.createPredicate(
        address,
        fuelProvider,
        [1],
      );

      const balance = await predicate.getBalance();

      if (balance.toString() !== bn(0).toString()) {
        predicateWithBalance = predicateVersion.pred;
        this.predicateAddress = predicateVersion.key;

        break;
      }
    }

    if (predicateWithBalance) {
      this.predicateAccount = new PredicateAccount({
        abi: predicateWithBalance.predicate.abi,
        bytecode: predicateWithBalance.predicate.bytecode,
      });

      return this.predicateAccount;
    }

    const newestPredicate = predicateVersions.sort(
      (a, b) => Number(b.pred.generatedAt) - Number(a.pred.generatedAt),
    )[0];

    if (newestPredicate) {
      this.predicateAccount = new PredicateAccount({
        abi: newestPredicate.pred.predicate.abi,
        bytecode: newestPredicate.pred.predicate.bytecode,
      });
      this.predicateAddress = newestPredicate.key;

      return this.predicateAccount;
    }

    throw new Error('No predicate found');
  }
}
