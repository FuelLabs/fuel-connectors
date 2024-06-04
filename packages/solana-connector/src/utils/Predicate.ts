import {
  Address,
  type InputValue,
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
    (svmAddress: string, provider: Provider): Predicate<InputValue[]> => {
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

  getSVMAddress(address: string, svmAccounts: Array<string> = []) {
    return svmAccounts.find(
      (account) => this.getPredicateAddress(account) === address,
    );
  }

  getPredicateAccounts(svmAccounts: Array<string> = []): Array<string> {
    return svmAccounts.map((account) => this.getPredicateAddress(account));
  }
}
