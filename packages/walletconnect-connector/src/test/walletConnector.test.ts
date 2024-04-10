// import path from 'node:path';
// import { launchNodeAndGetWallets } from '@fuel-ts/account/test-utils';
// import type { Asset, Provider } from 'fuels';
// import {
//   afterAll,
//   afterEach,
//   beforeAll,
//   beforeEach,
//   describe,
//   expect,
//   test,
// } from 'vitest';
// import { getPredicateAddress } from '../';
// import { predicates } from '../utils/predicateResources';
// import { MockProvider } from './mockProvider';
// import { testWalletconnectWalletConnector as WalletconnectWalletConnector } from './testConnector';

// const predicate = 'verification-predicate';

// describe('EVM Wallet Connector', () => {
//   // Providers used to interact with wallets
//   let ethProvider: MockProvider;
//   let fuelProvider: Provider;

//   // Our connector bridging MetaMask and predicate accounts
//   let connector: WalletconnectWalletConnector;

//   let stopProvider: () => void;

//   const bytecode = predicates[predicate].bytecode;
//   const abi = predicates[predicate].abi;

//   const chainConfigPath = path.join(__dirname, 'chainConfig.json');

//   beforeAll(async () => {
//     //Launch test node
//     process.env.GENESIS_SECRET =
//       '0x6e48a022f9d4ae187bca4e2645abd62198ae294ee484766edbdaadf78160dc68';
//     const { stop, provider } = await launchNodeAndGetWallets({
//       launchNodeOptions: {
//         args: ['--chain', chainConfigPath],
//         loggingEnabled: false,
//       },
//     });

//     fuelProvider = provider;
//     stopProvider = stop;
//   });

//   afterAll(() => {
//     stopProvider?.();
//   });

//   beforeEach(async () => {
//     // Create the Ethereum provider
//     ethProvider = new MockProvider();

//     const accounts = ethProvider.getAccounts();
//     if (accounts.length < 2) {
//       throw new Error('Not enough accounts available');
//     }

//     const predicateAccounts = await Promise.all(
//       accounts.map(async (account) =>
//         getPredicateAddress(account, bytecode, abi),
//       ),
//     );
//     if (predicateAccounts.length < 2) {
//       throw new Error('Not enough predicate accounts available');
//     }

//     // Class contains state, reset the state for each test
//     connector = new WalletconnectWalletConnector(ethProvider, fuelProvider);
//   });

//   afterEach(() => {
//     ethProvider.removeAllListeners();
//   });

//   describe('connect()', () => {
//     test('connects to ethers signer', async () => {
//       const connected = await connector.connect();

//       expect(connected).to.be.true;
//     });
//   });

//   describe('signMessage()', () => {
//     test('throws error', async () => {
//       await expect(() =>
//         connector.signMessage('address', 'message'),
//       ).rejects.toThrowError('A predicate account cannot sign messages');
//     });
//   });

//   describe('assets()', () => {
//     test('returns an empty array', async () => {
//       expect(await connector.assets()).to.deep.equal([]);
//     });
//   });

//   describe('addAsset()', () => {
//     test('throws error', async () => {
//       const asset: Asset = {
//         name: '',
//         symbol: '',
//         icon: '',
//         networks: [],
//       };
//       await expect(() => connector.addAsset(asset)).rejects.toThrowError(
//         'Method not implemented.',
//       );
//     });
//   });

//   describe('addAssets()', () => {
//     test('throws error', async () => {
//       await expect(() => connector.addAssets([])).rejects.toThrowError(
//         'Method not implemented.',
//       );
//     });
//   });

//   describe('addAbi()', () => {
//     test('throws error', async () => {
//       await expect(() => connector.addAbi({})).rejects.toThrowError(
//         'Method not implemented.',
//       );
//     });
//   });

//   describe('getAbi()', () => {
//     test('throws error', async () => {
//       await expect(() => connector.getAbi('contractId')).rejects.toThrowError(
//         'Cannot get contractId ABI for a predicate',
//       );
//     });
//   });

//   describe('hasAbi()', () => {
//     test('throws error', async () => {
//       await expect(() => connector.hasAbi('contractId')).rejects.toThrowError(
//         'A predicate account cannot have an ABI',
//       );
//     });
//   });

//   describe('network()', () => {
//     test('returns the fuel network info', async () => {
//       const network = await connector.currentNetwork();

//       expect(network.chainId.toString()).to.be.equal(
//         (await fuelProvider.getNetwork()).chainId.toString(),
//       );
//       expect(network.url).to.be.equal(fuelProvider.url);
//     });
//   });

//   describe('networks()', () => {
//     test('returns an array of fuel network info', async () => {
//       const networks = await connector.networks();
//       const network = networks.pop();

//       const networkChainId = network?.chainId.toString();
//       const connectorNetwork = await connector.fuelProvider?.getNetwork();
//       const expectedChainId = connectorNetwork
//         ? connectorNetwork.chainId.toString()
//         : undefined;
//       expect(networkChainId).to.be.equal(expectedChainId);

//       expect(network?.url).to.be.equal(fuelProvider.url);
//     });
//   });

//   describe('addNetwork()', () => {
//     test('throws error', async () => {
//       await expect(() => connector.addNetwork('')).rejects.toThrowError(
//         'Method not implemented.',
//       );
//     });
//   });
// });
