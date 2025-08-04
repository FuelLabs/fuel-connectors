import {
  ecrecover,
  fromRpcSig,
  hashPersonalMessage,
  pubToAddress,
} from '@ethereumjs/util';
import {
  type EIP1193Provider,
  EthereumWalletAdapter,
  type PredicateVersion,
  type PredicateWalletAdapter,
  type SignedMessageCustomCurve,
} from '@fuel-connectors/common';
import {
  PREDICATE_VERSIONS as EVM_PREDICATE_VERSIONS,
  txIdEncoders as EVM_TX_ID_ENCODERS,
} from '@fuel-connectors/evm-predicates';
import type { ConnectorMetadata } from 'fuels';
import { ReownConnector } from './ReownConnector';
import { EVM_IMAGE, INSTALL_METADATA, REOWN_NAMESPACES } from './constants';

export class ReownEvmConnector extends ReownConnector {
  public name = 'Ethereum Wallets';
  public namespace = REOWN_NAMESPACES.ethereum;
  public metadata: ConnectorMetadata = {
    image: EVM_IMAGE,
    install: INSTALL_METADATA,
  };

  protected static PREDICATE_VERSIONS: Record<string, PredicateVersion> =
    EVM_PREDICATE_VERSIONS;
  protected static WALLET_ADAPTER: PredicateWalletAdapter =
    new EthereumWalletAdapter();

  protected getProvider(): EIP1193Provider | null {
    return this.appkit.getProvider<EIP1193Provider>(this.namespace) ?? null;
  }

  getWalletAdapter(): PredicateWalletAdapter {
    return ReownEvmConnector.WALLET_ADAPTER;
  }

  getPredicateVersions(): Record<string, PredicateVersion> {
    return ReownEvmConnector.PREDICATE_VERSIONS;
  }

  async signMessageCustomCurve(
    message: string,
  ): Promise<SignedMessageCustomCurve> {
    const address = this.appkit.getAddress(this.namespace);
    if (!address) {
      throw new Error('No address found');
    }

    const provider = this.getProvider();
    if (!provider) {
      throw new Error('No provider found');
    }

    const signature = await provider.request({
      method: 'personal_sign',
      params: [message, address],
    });
    return {
      curve: 'secp256k1',
      signature: signature as string,
    };
  }

  async verifySignature(
    evmAddress: string,
    message: string,
    signature: string,
  ): Promise<boolean> {
    const provider = this.getProvider();
    if (!provider) {
      throw new Error('No provider found');
    }

    const msgBuffer = Uint8Array.from(Buffer.from(message));
    const msgHash = hashPersonalMessage(msgBuffer);
    const { v, r, s } = fromRpcSig(signature);
    const pubKey = ecrecover(msgHash, v, r, s);
    const recoveredAddress = Buffer.from(pubToAddress(pubKey)).toString('hex');

    // The recovered address doesn't have the 0x prefix
    return recoveredAddress.toLowerCase() === evmAddress.toLowerCase().slice(2);
  }

  public encodeTxId(txId: string): string {
    const encoder = EVM_TX_ID_ENCODERS[this.predicateAddress];
    if (!encoder) {
      return txId;
    }

    return encoder.encodeTxId(txId);
  }
}
