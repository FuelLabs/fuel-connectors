import type { EIP1193Provider } from './utils/eip-1193';
import { getPredicateAddress } from './utils/predicate';
import { predicates } from './utils/predicateResources';

export class PredicateAccount {
  private predicate = predicates['verification-predicate'];

  async getPredicateFromAddress(address: string, ethProvider: EIP1193Provider) {
    const accounts = await this.getPredicateAccounts(ethProvider);

    return accounts.find((account) => account.predicateAccount === address);
  }

  async getPredicateAccounts(ethProvider: EIP1193Provider): Promise<
    Array<{
      ethAccount: string;
      predicateAccount: string;
    }>
  > {
    const ethAccounts: Array<string> = await ethProvider.request({
      method: 'eth_accounts',
    });

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
