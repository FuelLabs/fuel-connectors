import type { WalletUnlocked } from 'fuels';
import { getPredicateAddress } from './utils/predicate';
import { predicates } from './utils/predicateResources';

export class PredicateAccount {
  private predicate = predicates['verification-predicate'];

  //@ts-ignore
  async getPredicateFromAddress(burnerWallet: WalletUnlocked) {
    const accounts = await this.getPredicateAccounts(burnerWallet);

    return accounts;
  }

  async getPredicateAccounts(burnerWallet: WalletUnlocked): Promise<
    Array<{
      burnerAccount: string;
      predicateAccount: string;
    }>
  > {
    const burnerAccount = burnerWallet.address.toString();

    const accounts = {
      burnerAccount,
      predicateAccount: getPredicateAddress(
        burnerAccount,
        this.predicate.bytecode,
        this.predicate.abi,
      ),
    };

    return [accounts];
  }
}
