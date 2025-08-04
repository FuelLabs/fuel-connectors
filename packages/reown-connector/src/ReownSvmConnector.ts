import { hexToBytes } from '@ethereumjs/util';
import { hexlify } from '@ethersproject/bytes';
import type {
  PredicateVersion,
  PredicateWalletAdapter,
} from '@fuel-connectors/common';
import { SolanaWalletAdapter } from '@fuel-connectors/common';
import { PREDICATE_VERSIONS as SOLANA_PREDICATE_VERSIONS } from '@fuel-connectors/svm-predicates';
import type { Provider as SolanaProvider } from '@reown/appkit-utils/solana';
import { PublicKey } from '@solana/web3.js';
import type { ConnectorMetadata } from 'fuels';
import { toUtf8Bytes } from 'fuels';
import nacl from 'tweetnacl';
import { ReownConnector } from './ReownConnector';
import { INSTALL_METADATA, REOWN_NAMESPACES, SVM_IMAGE } from './constants';

export class ReownSvmConnector extends ReownConnector {
  public override name = 'Solana Wallets';
  public namespace = REOWN_NAMESPACES.solana;
  public override metadata: ConnectorMetadata = {
    image: SVM_IMAGE,
    install: INSTALL_METADATA,
  };

  protected static PREDICATE_VERSIONS: Record<string, PredicateVersion> =
    SOLANA_PREDICATE_VERSIONS;
  protected static WALLET_ADAPTER: PredicateWalletAdapter =
    new SolanaWalletAdapter();

  protected getProvider(): SolanaProvider | null {
    return this.appkit.getProvider<SolanaProvider>(this.namespace) ?? null;
  }

  getWalletAdapter(): PredicateWalletAdapter {
    return ReownSvmConnector.WALLET_ADAPTER;
  }

  getPredicateVersions(): Record<string, PredicateVersion> {
    return ReownSvmConnector.PREDICATE_VERSIONS;
  }

  async signMessageCustomCurve(message: string, _address?: string) {
    const provider = this.getProvider();
    if (!provider) {
      throw new Error('No provider found');
    }

    const messageBytes = toUtf8Bytes(message);
    const signedMessage = await provider.signMessage(messageBytes);

    return {
      curve: 'edDSA',
      signature: hexlify(signedMessage),
    };
  }

  async verifySignature(
    svmAddress: string,
    message: string,
    signature: string,
  ): Promise<boolean> {
    const provider = this.getProvider();
    if (!provider) {
      throw new Error('No provider found');
    }

    if (!provider.publicKey) {
      throw new Error('No public key found');
    }

    return nacl.sign.detached.verify(
      toUtf8Bytes(message),
      hexToBytes(signature),
      new PublicKey(svmAddress).toBytes(),
    );
  }

  public encodeTxId(txId: string): string {
    return txId.slice(2);
  }
}
