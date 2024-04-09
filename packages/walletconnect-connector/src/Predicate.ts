import { type Config, getAccount } from '@wagmi/core';
import { getPredicateAddress } from './utils/predicate';
import { predicates } from './utils/predicateResources';

export class PredicateAccount {
  private predicate = predicates['verification-predicate'];

  async getPredicateFromAddress(address: string, ethConfig: Config) {
    const accounts = await this.getPredicateAccounts(ethConfig);

    return accounts.find((account) => account.predicateAccount === address);
  }

  async getPredicateAccounts(ethConfig: Config): Promise<
    Array<{
      ethAccount: string;
      predicateAccount: string;
    }>
  > {
    const ethAccounts = getAccount(ethConfig).addresses ?? [];

    const accounts = ethAccounts.map((account) => ({
      ethAccount: account,
      predicateAccount: getPredicateAddress(
        account,
        this.predicate.bytecode,
        this.predicate.abi,
      ),
    }));

    return accounts;
  }
}
