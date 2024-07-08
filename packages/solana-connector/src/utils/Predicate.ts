import { Keypair } from '@solana/web3.js';
import bs58 from 'bs58';
import {
  Address,
  type BN,
  type InputValue,
  type JsonAbi,
  Predicate,
  type Provider,
  ScriptTransactionRequest,
  ZeroBytes32,
  arrayify,
  bn,
  getPredicateRoot,
  hexlify,
  sha256,
} from 'fuels';
import memoize from 'memoizee';
import nacl from 'tweetnacl';
import type { SolanaPredicateConfig } from '../types';

export class PredicateAccount {
  private abi: JsonAbi;
  private bytecode: Uint8Array;

  constructor({ abi, bytecode }: SolanaPredicateConfig) {
    this.abi = abi;
    this.bytecode = bytecode;
  }

  getPredicateAddress = memoize((svmAddress: string): string => {
    const configurable = {
      SIGNER: hexlify(bs58.decode(svmAddress)),
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
      svmAddress: string,
      provider: Provider,
      inputData: TInputData,
    ): Predicate<InputValue[]> => {
      const configurable = {
        SIGNER: hexlify(bs58.decode(svmAddress)),
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

  getSVMAddress(address: string, svmAccounts: Array<string> = []) {
    return svmAccounts.find(
      (account) => this.getPredicateAddress(account) === address,
    );
  }

  getPredicateAccounts(svmAccounts: Array<string> = []): Array<string> {
    return svmAccounts.map((account) => this.getPredicateAddress(account));
  }

  getSmallTxId(txId: string) {
    const txIdNo0x = txId.slice(2);
    const idBytes = `${txIdNo0x.slice(0, 16)}${txIdNo0x.slice(-16)}`;
    return new TextEncoder().encode(idBytes);
  }

  getMaxPredicateGasUsed = memoize(async (provider: Provider): Promise<BN> => {
    const keypair = Keypair.generate();
    const chainId = provider.getChainId();
    const fakePredicate = this.createPredicate(
      keypair.publicKey.toString(),
      provider,
      [0],
    );
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
    const signature = nacl.sign.detached(
      this.getSmallTxId(txId),
      keypair.secretKey,
    );
    request.witnesses = [signature];
    await fakePredicate.provider.estimatePredicates(request);
    const predicateInput = request.inputs[0];
    if (predicateInput && 'predicate' in predicateInput) {
      return bn(predicateInput.predicateGasUsed);
    }
    return bn();
  });
}
