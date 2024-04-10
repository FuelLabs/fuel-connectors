// import EventEmitter from 'node:events';
// import {
//   bytesToHex,
//   ecsign,
//   hashPersonalMessage,
//   hexToBytes,
//   privateToAddress,
//   toRpcSig,
// } from '@ethereumjs/util';

// interface IMockProvider {
//   request(args: {
//     method: 'eth_accounts';
//     params: string[];
//   }): Promise<string[]>;
//   request(args: {
//     method: 'eth_requestAccounts';
//     params: string[];
//   }): Promise<string[]>;
//   request(args: {
//     method: 'wallet_requestPermissions';
//     params: string[];
//   }): Promise<string[]>;

//   request(args: {
//     method: 'wallet_revokePermissions';
//     params: string[];
//   }): Promise<null>;

//   request(args: { method: 'net_version' }): Promise<number>;
//   request(args: { method: 'eth_chainId'; params: string[] }): Promise<string>;

//   request(args: { method: 'personal_sign'; params: string[] }): Promise<string>;
//   request(args: { method: 'eth_decrypt'; params: string[] }): Promise<string>;

//   // biome-ignore lint/suspicious/noExplicitAny: This request pattern will match against unknown request types and error.
//   request(args: { method: string; params?: any[] }): Promise<any>;
// }

// export class MockProvider extends EventEmitter implements IMockProvider {
//   private accounts: { address: string; privateKey: Uint8Array }[] = [];
//   private connected = false;

//   public debug = false;

//   public isMetaMask = true;
//   public manualConfirmEnable = false;

//   private acceptEnable?: (value: unknown) => void;

//   private rejectEnable?: (value: unknown) => void;

//   constructor(numAccounts = 3) {
//     super();
//     for (let i = 0; i < numAccounts; i += 1) {
//       // const privateKey = randomBytes(32);
//       const privateKey = hexToBytes(
//         '0x96dfa8c25bdae93fa0b6460079f8bb18aaec70c8451b5e32251cbc22f0dbf308',
//       );
//       const address = bytesToHex(privateToAddress(privateKey));
//       this.accounts.push({ address, privateKey: privateKey });
//     }
//   }

//   get selectedAddress(): string {
//     if (this.accounts && this.accounts.length > 0) {
//       const selectedAddress = this.accounts[0]?.address;
//       if (selectedAddress) {
//         return selectedAddress;
//       }
//     }
//     throw new Error('Address not defined');
//   }

//   get networkVersion(): number {
//     return 1;
//   }

//   get chainId(): string {
//     return `0x${(1).toString(16)}`;
//   }

//   answerEnable(acceptance: boolean) {
//     if (acceptance) this.acceptEnable?.('Accepted');
//     else this.rejectEnable?.('User rejected');
//   }

//   getAccounts(): string[] {
//     return this.accounts.map(({ address }) => address);
//   }

//   // biome-ignore lint/suspicious/noExplicitAny: This pattern matches the EIP 1193 interface.
//   async request({ method, params }: any): Promise<any> {
//     switch (method) {
//       case 'eth_requestAccounts':
//         if (this.manualConfirmEnable) {
//           return new Promise((resolve, reject) => {
//             this.acceptEnable = resolve;
//             this.rejectEnable = reject;
//           }).then(() => this.accounts.map(({ address }) => address));
//         }
//         this.connected = true;
//         return this.accounts.map(({ address }) => address);

//       case 'wallet_requestPermissions':
//         if (this.manualConfirmEnable) {
//           return new Promise((resolve, reject) => {
//             this.acceptEnable = resolve;
//             this.rejectEnable = reject;
//           }).then(() => this.accounts.map(({ address }) => address));
//         }
//         this.connected = true;
//         return this.accounts.map(({ address }) => address);

//       case 'eth_accounts':
//         return this.connected ? this.getAccounts() : [];

//       case 'wallet_revokePermissions':
//         return null;

//       case 'net_version':
//         return this.networkVersion;

//       case 'eth_chainId':
//         return this.chainId;

//       case 'personal_sign': {
//         const [message, address] = params;
//         const account = this.accounts.find((a) => a.address === address);
//         if (!account) throw new Error('Account not found');

//         const hash = hashPersonalMessage(hexToBytes(message));
//         const signed = ecsign(hash, account.privateKey);
//         const signedStr = toRpcSig(signed.v, signed.r, signed.s);

//         return signedStr;
//       }

//       case 'eth_sendTransaction': {
//         throw new Error('This service can not send transactions.');
//       }

//       default:
//         throw new Error(
//           `The method ${method} is not implemented by the mock provider.`,
//         );
//     }
//   }

//   // biome-ignore lint/suspicious/noExplicitAny: This pattern matches the EIP 1193 interface.
//   sendAsync(props: { method: string }, cb: any) {
//     switch (props.method) {
//       case 'eth_accounts':
//         cb(null, { result: [this.getAccounts()] });
//         break;

//       case 'net_version':
//         cb(null, { result: this.networkVersion });
//         break;

//       default:
//         throw new Error(`Method '${props.method}' is not supported yet.`);
//     }
//   }

//   // biome-ignore lint/suspicious/noExplicitAny: This pattern matches the NodeJS.EventEmitter interface.
//   on(props: string, listener: (...args: any[]) => void) {
//     super.on(props, listener);
//     return this;
//   }

//   removeAllListeners() {
//     super.removeAllListeners();
//     return this;
//   }
// }
