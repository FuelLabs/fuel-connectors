import path from 'node:path';
import { launchNodeAndGetWallets } from '@fuel-ts/account/test-utils';
import {
  type Asset,
  BaseAssetId,
  type Provider,
  ScriptTransactionRequest,
  Wallet,
  WalletUnlocked,
  bn,
} from 'fuels';
import {
  afterAll,
  afterEach,
  beforeAll,
  beforeEach,
  describe,
  expect,
  test,
} from 'vitest';
import { createPredicate, getPredicateAddress } from '../index';
import { predicates } from '../utils/predicateResources';
import { MockProvider } from './mockProvider';
import { testEVMWalletConnector as EVMWalletConnector } from './testConnector';

const predicate = 'verification-predicate';

describe('EVM Wallet Connector', () => {
  // Providers used to interact with wallets
  let ethProvider: MockProvider;
  let fuelProvider: Provider;

  // Our connector bridging MetaMask and predicate accounts
  let connector: EVMWalletConnector;

  // Accounts from hardhat used to determine predicate accounts
  let ethAccount1: string;
  let ethAccount2: string;

  // Predicate accounts associated with the ethereum accounts
  let predicateAccount1: string;
  let predicateAccount2: string;

  let stopProvider: () => void;

  const bytecode = predicates[predicate].bytecode;
  const abi = predicates[predicate].abi;

  const chainConfigPath = path.join(__dirname, 'chainConfig.json');

  beforeAll(async () => {
    //Launch test node
    process.env.GENESIS_SECRET =
      '0x6e48a022f9d4ae187bca4e2645abd62198ae294ee484766edbdaadf78160dc68';
    const { stop, provider } = await launchNodeAndGetWallets({
      launchNodeOptions: {
        args: ['--chain', chainConfigPath],
        loggingEnabled: false,
      },
    });

    fuelProvider = provider;
    stopProvider = stop;
  });

  afterAll(() => {
    stopProvider?.();
  });

  beforeEach(async () => {
    // Create the Ethereum provider
    ethProvider = new MockProvider();

    const accounts = ethProvider.getAccounts();
    if (accounts.length < 2) {
      throw new Error('Not enough accounts available');
    }
    ethAccount1 = accounts[0] as string;
    ethAccount2 = accounts[1] as string;

    const predicateAccounts = await Promise.all(
      accounts.map(async (account) =>
        getPredicateAddress(account, bytecode, abi),
      ),
    );
    if (predicateAccounts.length < 2) {
      throw new Error('Not enough predicate accounts available');
    }
    predicateAccount1 = predicateAccounts[0] as string;
    predicateAccount2 = predicateAccounts[1] as string;

    // Class contains state, reset the state for each test
    connector = new EVMWalletConnector(ethProvider, fuelProvider);
  });

  afterEach(() => {
    ethProvider.removeAllListeners();
  });

  describe('connect()', () => {
    test('connects to ethers signer', async () => {
      const connected = await connector.connect();

      expect(connected).to.be.true;
    });
  });

  describe('isConnected()', () => {
    test('false when not connected', async () => {
      const connected = await connector.isConnected();

      expect(connected).to.be.false;
    });

    test('true when connected', async () => {
      await connector.connect();
      const connected = await connector.isConnected();

      expect(connected).to.be.true;
    });
  });

  describe('disconnect()', () => {
    test('disconnects from ethers signer', async () => {
      await connector.connect();

      const connected = await connector.disconnect();

      expect(connected).to.be.false;
    });
  });

  describe('accounts()', () => {
    test('returns the predicate accounts associated with the wallet', async () => {
      await connector.connect();

      const predicateAccounts = await connector.accounts();
      const acc1 = predicateAccounts[0];
      const acc2 = predicateAccounts[1];

      expect(acc1).to.be.equal(predicateAccount1);
      expect(acc2).to.be.equal(predicateAccount2);
    });
  });

  describe('currentAccount()', () => {
    test('returns the predicate account associated with the current signer account', async () => {
      await connector.connect();

      const account = await connector.currentAccount();

      expect(account).to.be.equal(predicateAccount1);
    });

    test('throws error when not connected', async () => {
      await expect(() => connector.currentAccount()).rejects.toThrowError(
        'No connected accounts',
      );
    });
  });

  describe('signMessage()', () => {
    test('throws error', async () => {
      await expect(() =>
        connector.signMessage('address', 'message'),
      ).rejects.toThrowError('A predicate account cannot sign messages');
    });
  });

  describe('sendTransaction()', () => {
    const ALT_ASSET_ID =
      '0x0101010101010101010101010101010101010101010101010101010101010101';

    test('transfer when the current signer is passed in', async () => {
      const predicate = await createPredicate(
        ethAccount1,
        fuelProvider,
        bytecode,
        abi,
      );

      const fundingWallet = new WalletUnlocked('0x01', fuelProvider);

      // Transfer base asset coins to predicate
      await fundingWallet
        .transfer(predicate.address, 1_000_000, BaseAssetId, {
          gasLimit: 10000,
          gasPrice: 1,
        })
        .then((resp) => resp.wait());
      // Transfer alt asset coins to predicate
      await fundingWallet
        .transfer(predicate.address, 1_000_000, ALT_ASSET_ID, {
          gasLimit: 10000,
          gasPrice: 1,
        })
        .then((resp) => resp.wait());

      // Check predicate balances
      const predicateETHBalanceInitial = await predicate.getBalance();
      const predicateAltBalanceInitial =
        await predicate.getBalance(ALT_ASSET_ID);

      // Check predicate has the balance required
      expect(predicateETHBalanceInitial.gte(1000000));
      expect(predicateAltBalanceInitial.gte(1000000));

      // Amount to transfer
      const amountToTransfer = 10;

      // Create a recipient Wallet
      const recipientWallet = Wallet.generate({ provider: fuelProvider });
      const recipientBalanceInitial =
        await recipientWallet.getBalance(ALT_ASSET_ID);

      // Create transfer from predicate to recipient
      const transactionRequest = new ScriptTransactionRequest({
        gasLimit: 10000,
        gasPrice: 1,
      });
      transactionRequest.addCoinOutput(
        recipientWallet.address,
        amountToTransfer,
        ALT_ASSET_ID,
      );

      // fund transaction
      const resources = await predicate.getResourcesToSpend([
        {
          assetId: BaseAssetId,
          amount: bn(1_000_000),
        },
        {
          assetId: ALT_ASSET_ID,
          amount: bn(1_000_000),
        },
      ]);
      transactionRequest.addResources(resources);

      // Connect ETH account
      await connector.connect();

      // TODO: The user accounts mapping must be populated in order to check if the account is valid
      // Temporary hack here?
      await connector.accounts();

      //  Send transaction using EvmWalletConnector
      await connector.sendTransaction(predicateAccount1, transactionRequest);

      // Check balances are correct
      const predicateAltBalanceFinal = await predicate.getBalance(ALT_ASSET_ID);
      const recipientBalanceFinal =
        await recipientWallet.getBalance(ALT_ASSET_ID);

      expect(predicateAltBalanceFinal.toString()).eq(
        predicateAltBalanceInitial.sub(amountToTransfer).toString(),
      );
      expect(recipientBalanceFinal.toString()).eq(
        recipientBalanceInitial.add(amountToTransfer).toString(),
      );
    });

    test('transfer when a different valid signer is passed in', async () => {
      const predicate = await createPredicate(
        ethAccount2,
        fuelProvider,
        bytecode,
        abi,
      );

      const fundingWallet = new WalletUnlocked('0x01', fuelProvider);

      // Transfer base asset coins to predicate
      await fundingWallet
        .transfer(predicate.address, 1_000_000, BaseAssetId, {
          gasLimit: 10000,
          gasPrice: 1,
        })
        .then((resp) => resp.wait());
      // Transfer alt asset coins to predicate
      await fundingWallet
        .transfer(predicate.address, 1_000_000, ALT_ASSET_ID, {
          gasLimit: 10000,
          gasPrice: 1,
        })
        .then((resp) => resp.wait());

      // Check predicate balances
      const predicateETHBalanceInitial = await predicate.getBalance();
      const predicateAltBalanceInitial =
        await predicate.getBalance(ALT_ASSET_ID);

      // Check predicate has the balance required
      expect(predicateETHBalanceInitial.gte(1000000));
      expect(predicateAltBalanceInitial.gte(1000000));

      // Amount to transfer
      const amountToTransfer = 10;

      // Create a recipient Wallet
      const recipientWallet = Wallet.generate({ provider: fuelProvider });
      const recipientBalanceInitial =
        await recipientWallet.getBalance(ALT_ASSET_ID);

      // Create transfer from predicate to recipient
      const transactionRequest = new ScriptTransactionRequest({
        gasLimit: 10000,
        gasPrice: 1,
      });
      transactionRequest.addCoinOutput(
        recipientWallet.address,
        amountToTransfer,
        ALT_ASSET_ID,
      );

      // fund transaction
      const resources = await predicate.getResourcesToSpend([
        {
          assetId: BaseAssetId,
          amount: bn(1_000_000),
        },
        {
          assetId: ALT_ASSET_ID,
          amount: bn(1_000_000),
        },
      ]);
      transactionRequest.addResources(resources);

      // Connect ETH account
      await connector.connect();

      // TODO: The user accounts mapping must be populated in order to check if the account is valid
      // Temporary hack here?
      await connector.accounts();

      // Send transaction using EvmWalletConnector
      await connector.sendTransaction(predicateAccount2, transactionRequest);

      // Check balances are correct
      const predicateAltBalanceFinal = await predicate.getBalance(ALT_ASSET_ID);
      const recipientBalanceFinal =
        await recipientWallet.getBalance(ALT_ASSET_ID);

      expect(predicateAltBalanceFinal.toString()).eq(
        predicateAltBalanceInitial.sub(amountToTransfer).toString(),
      );
      expect(recipientBalanceFinal.toString()).eq(
        recipientBalanceInitial.add(amountToTransfer).toString(),
      );
    });

    test('errors when an invalid signer is passed in', async () => {
      const predicate = await createPredicate(
        ethAccount1,
        fuelProvider,
        bytecode,
        abi,
      );

      const fundingWallet = new WalletUnlocked('0x01', fuelProvider);

      // Transfer base asset coins to predicate
      await fundingWallet
        .transfer(predicate.address, 1_000_000, BaseAssetId, {
          gasLimit: 10000,
          gasPrice: 1,
        })
        .then((resp) => resp.wait());
      // Transfer alt asset coins to predicate
      await fundingWallet
        .transfer(predicate.address, 1_000_000, ALT_ASSET_ID, {
          gasLimit: 10000,
          gasPrice: 1,
        })
        .then((resp) => resp.wait());

      // Check predicate balances
      const predicateETHBalanceInitial = await predicate.getBalance();
      const predicateAltBalanceInitial =
        await predicate.getBalance(ALT_ASSET_ID);

      // Check predicate has the balance required
      expect(predicateETHBalanceInitial.gte(1000000));
      expect(predicateAltBalanceInitial.gte(1000000));

      // Amount to transfer
      const amountToTransfer = 10;

      // Create a recipient Wallet
      const recipientWallet = Wallet.generate({ provider: fuelProvider });

      // Create transfer from predicate to recipient
      const transactionRequest = new ScriptTransactionRequest({
        gasLimit: 10000,
        gasPrice: 1,
      });
      transactionRequest.addCoinOutput(
        recipientWallet.address,
        amountToTransfer,
        ALT_ASSET_ID,
      );

      // fund transaction
      const resources = await predicate.getResourcesToSpend([
        {
          assetId: BaseAssetId,
          amount: bn(1_000_000),
        },
        {
          assetId: ALT_ASSET_ID,
          amount: bn(1_000_000),
        },
      ]);
      transactionRequest.addResources(resources);

      // Connect ETH account
      await connector.connect();

      // TODO: The user accounts mapping must be populated in order to check if the account is valid
      // Temporary hack here?
      await connector.accounts();

      await expect(() =>
        connector.sendTransaction(
          predicateAccount2.replaceAll('h', 'X'),
          transactionRequest,
        ),
      ).rejects.toThrowError(
        `No account found for ${predicateAccount2.replaceAll('h', 'X')}`,
      );
    });
  });

  describe('assets()', () => {
    test('returns an empty array', async () => {
      expect(await connector.assets()).to.deep.equal([]);
    });
  });

  describe('addAsset()', () => {
    test('throws error', async () => {
      const asset: Asset = {
        name: '',
        symbol: '',
        icon: '',
        networks: [],
      };
      await expect(() => connector.addAsset(asset)).rejects.toThrowError(
        'Method not implemented.',
      );
    });
  });

  describe('addAssets()', () => {
    test('throws error', async () => {
      await expect(() => connector.addAssets([])).rejects.toThrowError(
        'Method not implemented.',
      );
    });
  });

  describe('addAbi()', () => {
    test('throws error', async () => {
      await expect(() => connector.addAbi({})).rejects.toThrowError(
        'Method not implemented.',
      );
    });
  });

  describe('getAbi()', () => {
    test('throws error', async () => {
      await expect(() => connector.getAbi('contractId')).rejects.toThrowError(
        'Cannot get contractId ABI for a predicate',
      );
    });
  });

  describe('hasAbi()', () => {
    test('throws error', async () => {
      await expect(() => connector.hasAbi('contractId')).rejects.toThrowError(
        'A predicate account cannot have an ABI',
      );
    });
  });

  describe('network()', () => {
    test('returns the fuel network info', async () => {
      const network = await connector.currentNetwork();

      expect(network.chainId.toString()).to.be.equal(
        (await fuelProvider.getNetwork()).chainId.toString(),
      );
      expect(network.url).to.be.equal(fuelProvider.url);
    });
  });

  describe('networks()', () => {
    test('returns an array of fuel network info', async () => {
      const networks = await connector.networks();
      const network = networks.pop();

      const networkChainId = network?.chainId.toString();
      const connectorNetwork = await connector.fuelProvider?.getNetwork();
      const expectedChainId = connectorNetwork
        ? connectorNetwork.chainId.toString()
        : undefined;
      expect(networkChainId).to.be.equal(expectedChainId);

      expect(network?.url).to.be.equal(fuelProvider.url);
    });
  });

  describe('addNetwork()', () => {
    test('throws error', async () => {
      await expect(() => connector.addNetwork('')).rejects.toThrowError(
        'Method not implemented.',
      );
    });
  });
});
