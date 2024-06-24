import { arrayify } from '@ethersproject/bytes';
import {
  Address,
  type BN,
  type InputValue,
  type JsonAbi,
  Predicate,
  type Provider,
  ScriptTransactionRequest,
  ZeroBytes32,
  bn,
  getPredicateRoot,
} from 'fuels';
import memoize from 'memoizee';
import { privateKeyToAccount } from 'viem/accounts';

import type { PredicateConfig } from '../types';

export class PredicateAccount {
  private abi: JsonAbi;
  private bytecode: Uint8Array;

  constructor({ abi, bytecode }: PredicateConfig) {
    this.abi = abi;
    this.bytecode = bytecode;
  }

  getPredicateAddress = memoize((evmAddress: string): string => {
    const configurable = {
      SIGNER: Address.fromEvmAddress(evmAddress).toB256(),
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
        SIGNER: Address.fromEvmAddress(evmAddress).toB256(),
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

  getMaxPredicateGasUsed = memoize(async (provider: Provider): Promise<BN> => {
    const account = privateKeyToAccount(
      '0x0000000000000000000000000000000000000000000000000000000000000001',
    );
    const chainId = provider.getChainId();
    const fakePredicate = this.createPredicate(account.address, provider, [0]);
    const request = new ScriptTransactionRequest();
    request.addCoinInput({
      id: ZeroBytes32,
      assetId: ZeroBytes32,
      amount: bn(),
      owner: fakePredicate.address,
      blockCreated: bn(),
      txCreatedIdx: bn(),
    });
    fakePredicate.populateTransactionPredicateData(request);
    const txId = request.getTransactionId(chainId);
    const signature = await account.signMessage({
      message: txId,
    });
    request.witnesses = [signature];
    await fakePredicate.provider.estimatePredicates(request);
    const predicateInput = request.inputs[0];
    if (predicateInput && 'predicate' in predicateInput) {
      return bn(predicateInput.predicateGasUsed);
    }
    return bn();
  });

  getEVMAddress(address: string, evmAccounts: Array<string> = []) {
    return evmAccounts.find(
      (account) => this.getPredicateAddress(account) === address,
    );
  }

  getPredicateAccounts(evmAccounts: Array<string> = []): Array<string> {
    return evmAccounts.map((account) => this.getPredicateAddress(account));
  }
}
