import { arrayify } from '@ethersproject/bytes';
import {
  Address,
  type BN,
  type InputValue,
  type JsonAbi,
  Predicate,
  type Provider,
  getPredicateRoot,
} from 'fuels';
import memoize from 'memoizee';
import type { PredicateConfig } from './types';

export class PredicateAccount {
  private abi: JsonAbi;
  private bytecode: Uint8Array;

  constructor({ abi, bytecode }: PredicateConfig) {
    this.abi = abi;
    this.bytecode = bytecode;
  }

  getPredicateAddress = memoize((evmAddress: string): string => {
    const configurable = {
      SIGNER: Address.fromEvmAddress(evmAddress).toEvmAddress(),
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
    <TInputData extends InputValue[]>(
      evmAddress: string,
      provider: Provider,
      inputData?: TInputData,
    ): Predicate<TInputData> => {
      const configurable = {
        SIGNER: Address.fromEvmAddress(evmAddress).toEvmAddress(),
      };
      const predicate = new Predicate({
        bytecode: arrayify(this.bytecode),
        abi: this.abi,
        provider,
        configurableConstants: configurable,
        inputData,
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
