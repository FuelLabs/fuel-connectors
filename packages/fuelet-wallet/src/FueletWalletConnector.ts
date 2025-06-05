import { FuelWalletConnector } from '@fuel-connectors/fuel-wallet';
import { bech32 } from 'bech32';
import { Address, type ConnectorMetadata } from 'fuels';
import { APP_IMAGE_DARK, APP_IMAGE_LIGHT } from './constants';

function decodeBech32NoChecksum(address: string): Uint8Array {
  // Find the separator position (the last occurrence of "1")
  const sepPosition = address.lastIndexOf('1');
  if (sepPosition < 1) {
    throw new Error('Invalid bech32 address: missing separator');
  }

  const data = address.slice(sepPosition + 1, address.length - 6);
  const ALPHABET = 'qpzry9x8gf2tvdw0s3jn54khce6mua7l';
  const words = [];
  for (const char of data) {
    const value = ALPHABET.indexOf(char);
    if (value === -1) {
      throw new Error(`Invalid character '${char}' in bech32 address`);
    }
    words.push(value);
  }
  // Convert 5-bit words to bytes
  return Uint8Array.from(bech32.fromWords(words));
}
export class FueletWalletConnector extends FuelWalletConnector {
  name = 'Fuelet Wallet';
  metadata: ConnectorMetadata = {
    image: {
      dark: APP_IMAGE_DARK,
      light: APP_IMAGE_LIGHT,
    },
    install: {
      action: 'Install',
      description: 'Install Fuelet Wallet in order to connect it.',
      link: 'https://fuelet.app/download/',
    },
  };

  constructor() {
    super('Fuelet Wallet');
  }

  async currentAccount(): Promise<string | null> {
    const account = await this.client.request('currentAccount', {});
    if (!account) return null;

    // Handle a bech32 address that starts with "fuel"
    if (account.startsWith('fuel')) {
      try {
        // Use the custom, no-checksum decoding function.
        const bytes = decodeBech32NoChecksum(account);
        if (bytes.length !== 32) {
          throw new Error('Decoded bech32 address does not have 32 bytes.');
        }
        const hex = `0x${Array.from(bytes)
          .map((b) => b.toString(16).padStart(2, '0'))
          .join('')}`;
        return Address.fromDynamicInput(hex).toString();
      } catch (error) {
        throw new Error(
          `Failed to decode bech32 address (no-checksum): ${
            error instanceof Error ? error.message : error
          }`,
        );
      }
    }

    return super.currentAccount();
  }

  isMobile() {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini|Mobile|mobile|CriOS/i.test(
      navigator.userAgent,
    );
  }

  isFueletWebView() {
    return /FueletMobileApp/i.test(navigator.userAgent);
  }

  isMobileNativeBrowser() {
    return !this.isFueletWebView() && this.isMobile();
  }

  async connect() {
    if (this.isMobileNativeBrowser()) {
      window.location.href = `app.fuelet://browser?url=${window.location.href}&action=connect`;
      // we don't connect the wallet in the browser but redirect to the mobile app
      return false;
    }
    return super.connect();
  }

  async ping() {
    return this.isMobileNativeBrowser() || (await super.ping());
  }
}
