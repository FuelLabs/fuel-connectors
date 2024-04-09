import { getPredicateAddress } from './utils/predicate';
import { predicates } from './utils/predicateResources';

export class PredicateAccount {
  private predicate = predicates['verification-predicate'];

  async getPredicateFromAddress(address: string, ethProvider: unknown) {
    const accounts = await this.getPredicateAccounts(ethProvider);

    return accounts.find((account) => account.predicateAccount === address);
  }

  async getPredicateAccounts(ethProvider: unknown): Promise<
    Array<{
      ethAccount: string;
      predicateAccount: string;
    }>
  > {
    //@ts-ignore
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
