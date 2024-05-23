import {
  Address,
  type JsonAbi,
  Predicate,
  type Provider,
  arrayify,
  getPredicateRoot,
  sha256,
} from 'fuels';
import memoize from 'memoizee';
import type { PredicateConfig } from '../types';

export class PredicateAccount {
  private abi: JsonAbi;
  private bytecode: Uint8Array;
  private encoder: TextEncoder;

  constructor({ abi, bytecode }: PredicateConfig) {
    this.abi = abi;
    this.bytecode = bytecode;

    this.encoder = new TextEncoder();
  }

  getPredicateAddress = memoize((svmAddress: string): string => {
    const configurable = {
      SIGNER: sha256(this.encoder.encode(svmAddress)),
    };
    // @ts-ignore
    const { predicateBytes } = Predicate.processPredicateData(
      this.bytecode,
      this.abi,
      configurable,
    );
    const address = Address.fromB256(getPredicateRoot(predicateBytes));

    return address.toString();
  });

  createPredicate = memoize(
    (provider: Provider, svmAddress: string): Predicate<unknown> => {
      const address = sha256(this.encoder.encode(svmAddress));

      const configurable = {
        SIGNER: address,
      };

      const predicate = new Predicate({
        bytecode: arrayify(this.bytecode),
        abi: this.abi,
        provider,
        configurableConstants: configurable,
      });

      return predicate;
    },
  );

  getEVMAddress(address: string, evmAccounts: Array<string> = []) {
    return evmAccounts.find(
      (account) => this.getPredicateAddress(account) === address,
    );
  }

  getPredicateAccounts(evmAccounts: Array<string> = []): Array<string> {
    return evmAccounts.map((account) => this.getPredicateAddress(account));
  }
}
