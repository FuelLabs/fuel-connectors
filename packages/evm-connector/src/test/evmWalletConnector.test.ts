import path from 'node:path';
import { launchNodeAndGetWallets } from '@fuel-ts/account/test-utils';
import {
  Address,
  type Asset,
  InputType,
  type Predicate,
  type Provider,
  ScriptTransactionRequest,
  Wallet,
  WalletUnlocked,
  arrayify,
  bn,
  hexlify,
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
import { PredicateAccount } from '../Predicate';
import { MockProvider } from './mockProvider';
import { VERSIONS } from './mocked-versions/versions-dictionary';
import { testEVMWalletConnector as EVMWalletConnector } from './testConnector';
import { Utils } from './utils/versions';

const predicate =
  VERSIONS['0x25acef54b039107f213125f567991d98e0c83dc3be8cf5a984394b1960c055ac']
    .predicate;

const MAX_FEE = bn(10_000);

async function createTransaction(
  predicate: Predicate<number[]>,
  address: string,
) {
  const ALT_ASSET_ID =
    '0x0101010101010101010101010101010101010101010101010101010101010101';

  try {
    const tx = new ScriptTransactionRequest({
      gasLimit: bn(10_000),
      maxFee: MAX_FEE,
    });

    const provider = predicate.provider;

    const coins = await predicate.getResourcesToSpend([
      {
        assetId: provider.getBaseAssetId(),
        amount: bn.parseUnits('0.001'),
      },
      {
        assetId: ALT_ASSET_ID,
        amount: bn.parseUnits('0.001'),
      },
    ]);

    tx.addResources(coins);

    tx.inputs?.forEach((input) => {
      if (
        input.type === InputType.Coin &&
        hexlify(input.owner) === predicate.address.toB256()
      ) {
        input.predicate = arrayify(predicate.bytes);
      }
    });

    tx.addCoinOutput(
      Address.fromString(address),
      bn.parseUnits('0.0001'),
      provider.getBaseAssetId(),
    );

    tx.addCoinOutput(
      Address.fromString(address),
      bn.parseUnits('0.0001'),
      ALT_ASSET_ID,
    );

    return tx;
  } catch (e) {
    throw new Error(
      //@ts-ignore
      e?.response?.errors[0].message ?? e,
    );
  }
}

describe('EVM Wallet Connector', () => {
  // Providers used to interact with wallets
  let ethProvider: MockProvider;
  let fuelProvider: Provider;

  let baseAssetId: string;

  let stopProvider: () => void;

  const snapshotPath = path.join(__dirname, 'chain_config');

  beforeAll(async () => {
    //Launch test node
    process.env.GENESIS_SECRET =
      '0x6e48a022f9d4ae187bca4e2645abd62198ae294ee484766edbdaadf78160dc68';
    const { stop, provider } = await launchNodeAndGetWallets({
      launchNodeOptions: {
        args: ['--snapshot', snapshotPath],
        loggingEnabled: false,
      },
    });

    fuelProvider = provider;
    baseAssetId = fuelProvider.getBaseAssetId();

    stopProvider = stop;
  });

  afterAll(() => {
    stopProvider?.();
  });

  beforeEach(async () => {
    // Create the Ethereum provider
    ethProvider = new MockProvider();
  });

  afterEach(() => {
    ethProvider.removeAllListeners();
  });

  describe('connect()', () => {
    test('connects to ethers signer', async () => {
      const connector = new EVMWalletConnector({
        ethProvider,
        fuelProvider,
      });

      const connected = await connector.connect();

      expect(connected).to.be.true;
    });
  });

  describe('isConnected()', () => {
    test('false when not connected', async () => {
      const connector = new EVMWalletConnector({
        ethProvider,
        fuelProvider,
      });

      const connected = await connector.isConnected();

      expect(connected).to.be.false;
    });

    test('true when connected', async () => {
      const connector = new EVMWalletConnector({
        ethProvider,
        fuelProvider,
      });

      await connector.connect();
      const connected = await connector.isConnected();

      expect(connected).to.be.true;
    });
  });

  describe('disconnect()', () => {
    test('disconnects from ethers signer', async () => {
      const connector = new EVMWalletConnector({
        ethProvider,
        fuelProvider,
      });

      await connector.connect();

      const connected = await connector.disconnect();

      expect(connected).to.be.false;
    });
  });

  describe('accounts()', () => {
    test('returns the predicate accounts associated with the wallet', async () => {
      const accounts = ethProvider.getAccounts();

      const predicateAccount = new PredicateAccount(predicate);

      const connector = new EVMWalletConnector({
        ethProvider,
        fuelProvider,
        predicateConfig: predicate,
      });
      await connector.connect();

      const connectorAccounts = await connector.accounts();

      const predicateAccounts = predicateAccount.getPredicateAccounts(accounts);

      expect(connectorAccounts[0]).to.be.equal(predicateAccounts[0]);
      expect(connectorAccounts[1]).to.be.equal(predicateAccounts[1]);
    });
  });

  describe('currentAccount()', () => {
    test('returns the predicate account associated with the current signer account', async () => {
      const accounts = ethProvider.getAccounts();

      const predicateAccount = new PredicateAccount(predicate);

      const predicateAddress = predicateAccount.getPredicateAddress(
        accounts[0] as string,
      );

      const evmConnector = new EVMWalletConnector({
        ethProvider,
        fuelProvider,
        predicateConfig: predicate,
      });

      await evmConnector.connect();

      const account = await evmConnector.currentAccount();

      expect(account).to.be.equal(predicateAddress);
    });

    test('throws error when not connected', async () => {
      const connector = new EVMWalletConnector({
        ethProvider,
        fuelProvider,
      });

      await expect(() => connector.currentAccount()).rejects.toThrowError(
        'No connected accounts',
      );
    });
  });

  describe('signMessage()', () => {
    test('throws error', async () => {
      const connector = new EVMWalletConnector({
        ethProvider,
        fuelProvider,
      });

      await expect(() =>
        connector.signMessage('address', 'message'),
      ).rejects.toThrowError('A predicate account cannot sign messages');
    });
  });

  describe('sendTransaction()', () => {
    const ALT_ASSET_ID =
      '0x0101010101010101010101010101010101010101010101010101010101010101';

    test.skip('transfer when the current signer is passed in', async () => {
      const version =
        '0x25acef54b039107f213125f567991d98e0c83dc3be8cf5a984394b1960c055ac';

      const accounts = ethProvider.getAccounts();
      const predicateAccount = new PredicateAccount(predicate);
      const ethAccount1 = accounts[0] as string;

      const accountAddress = predicateAccount.getPredicateAddress(ethAccount1);
      const fundingWallet = new WalletUnlocked('0x01', fuelProvider);

      const createdPredicate = predicateAccount.createPredicate(
        ethAccount1,
        fuelProvider,
        [0],
      );

      // Transfer base asset coins to predicate
      await fundingWallet
        .transfer(createdPredicate.address, 1_000_000, baseAssetId, {
          gasLimit: 10000,
          maxFee: MAX_FEE,
        })
        .then((resp) => resp.wait());
      // Transfer alt asset coins to predicate
      await fundingWallet
        .transfer(createdPredicate.address, 1_000_000, ALT_ASSET_ID, {
          gasLimit: 10000,
          maxFee: MAX_FEE,
        })
        .then((resp) => resp.wait());

      // Create a recipient Wallet
      const recipientWallet = Wallet.generate({ provider: fuelProvider });
      const recipientBalanceInitial =
        await recipientWallet.getBalance(ALT_ASSET_ID);

      // Create transfer from predicate to recipient
      const transactionRequest = await createTransaction(
        createdPredicate,
        recipientWallet.address.toString(),
      );

      const connector = new EVMWalletConnector({
        ethProvider,
        fuelProvider,
        predicateConfig: VERSIONS[version].predicate,
      });

      // Check predicate balances
      const predicateETHBalanceInitial = await createdPredicate.getBalance();
      const predicateAltBalanceInitial =
        await createdPredicate.getBalance(ALT_ASSET_ID);

      // Check predicate has the balance required
      expect(predicateETHBalanceInitial.gte(1000000));
      expect(predicateAltBalanceInitial.gte(1000000));

      // Connect ETH account
      await connector.connect();

      // TODO: The user accounts mapping must be populated in order to check if the account is valid
      // Temporary hack here?
      await connector.accounts();

      await connector.sendTransaction(accountAddress, transactionRequest);

      // Check balances are correct
      const predicateAltBalanceFinal =
        await createdPredicate.getBalance(ALT_ASSET_ID);
      const recipientBalanceFinal =
        await recipientWallet.getBalance(ALT_ASSET_ID);

      expect(predicateAltBalanceFinal.toString()).eq(
        predicateAltBalanceInitial.sub(bn.parseUnits('0.0001')).toString(),
      );
      expect(recipientBalanceFinal.toString()).eq(
        recipientBalanceInitial.add(bn.parseUnits('0.0001')).toString(),
      );
    });

    test.skip('transfer when a different valid signer is passed in', async () => {
      const version =
        '0x25acef54b039107f213125f567991d98e0c83dc3be8cf5a984394b1960c055ac';

      const accounts = ethProvider.getAccounts();
      const predicateAccount = new PredicateAccount(predicate);
      const ethAccount1 = accounts[1] as string;

      const accountAddress = predicateAccount.getPredicateAddress(ethAccount1);
      const fundingWallet = new WalletUnlocked('0x01', fuelProvider);

      const createdPredicate = predicateAccount.createPredicate(
        ethAccount1,
        fuelProvider,
        [0],
      );

      // Transfer base asset coins to predicate
      await fundingWallet
        .transfer(createdPredicate.address, 1_000_000, baseAssetId, {
          gasLimit: 10000,
          maxFee: MAX_FEE,
        })
        .then((resp) => resp.wait());
      // Transfer alt asset coins to predicate
      await fundingWallet
        .transfer(createdPredicate.address, 1_000_000, ALT_ASSET_ID, {
          gasLimit: 10000,
          maxFee: MAX_FEE,
        })
        .then((resp) => resp.wait());

      // Create a recipient Wallet
      const recipientWallet = Wallet.generate({ provider: fuelProvider });
      const recipientBalanceInitial =
        await recipientWallet.getBalance(ALT_ASSET_ID);

      // Create transfer from predicate to recipient
      const transactionRequest = await createTransaction(
        createdPredicate,
        recipientWallet.address.toString(),
      );

      const connector = new EVMWalletConnector({
        ethProvider,
        fuelProvider,
        predicateConfig: VERSIONS[version].predicate,
      });

      // Check predicate balances
      const predicateETHBalanceInitial = await createdPredicate.getBalance();
      const predicateAltBalanceInitial =
        await createdPredicate.getBalance(ALT_ASSET_ID);

      // Check predicate has the balance required
      expect(predicateETHBalanceInitial.gte(1000000));
      expect(predicateAltBalanceInitial.gte(1000000));

      // Connect ETH account
      await connector.connect();

      // TODO: The user accounts mapping must be populated in order to check if the account is valid
      // Temporary hack here?
      await connector.accounts();

      await connector.sendTransaction(accountAddress, transactionRequest);

      // Check balances are correct
      const predicateAltBalanceFinal =
        await createdPredicate.getBalance(ALT_ASSET_ID);
      const recipientBalanceFinal =
        await recipientWallet.getBalance(ALT_ASSET_ID);

      expect(predicateAltBalanceFinal.toString()).eq(
        predicateAltBalanceInitial.sub(bn.parseUnits('0.0001')).toString(),
      );
      expect(recipientBalanceFinal.toString()).eq(
        recipientBalanceInitial.add(bn.parseUnits('0.0001')).toString(),
      );
    });

    test('errors when an invalid signer is passed in', async () => {
      const connector = new EVMWalletConnector({
        ethProvider,
        fuelProvider,
      });

      const accounts = ethProvider.getAccounts();
      const predicateAccount = new PredicateAccount(predicate);

      const ethAccount1 = accounts[0] as string;
      const ethAccount2 = accounts[1] as string;

      const predicateAccount2 =
        predicateAccount.getPredicateAddress(ethAccount2);

      const createdPredicate = predicateAccount.createPredicate(
        ethAccount1,
        fuelProvider,
        [0],
      );

      const fundingWallet = new WalletUnlocked('0x01', fuelProvider);

      // Transfer base asset coins to predicate
      await fundingWallet
        .transfer(createdPredicate.address, 1_000_000, baseAssetId, {
          gasLimit: 10000,
          maxFee: MAX_FEE,
        })
        .then((resp) => resp.wait());
      // Transfer alt asset coins to predicate
      await fundingWallet
        .transfer(createdPredicate.address, 1_000_000, ALT_ASSET_ID, {
          gasLimit: 10000,
          maxFee: MAX_FEE,
        })
        .then((resp) => resp.wait());

      const transactionRequest = await createTransaction(
        createdPredicate,
        fundingWallet.address.toString(),
      );

      // Check predicate balances
      const predicateETHBalanceInitial = await createdPredicate.getBalance();
      const predicateAltBalanceInitial =
        await createdPredicate.getBalance(ALT_ASSET_ID);

      // Check predicate has the balance required
      expect(predicateETHBalanceInitial.gte(1000000));
      expect(predicateAltBalanceInitial.gte(1000000));

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
      ).rejects.toThrowError();
    });
  });

  describe('setupPredicate()', () => {
    test('Should instantiate a predicate with given config', async () => {
      const version =
        '0x25acef54b039107f213125f567991d98e0c83dc3be8cf5a984394b1960c055ac';

      const evmConnector = new EVMWalletConnector({
        ethProvider,
        fuelProvider,
        predicateConfig: VERSIONS[version].predicate,
      });

      await evmConnector.connect();

      expect(evmConnector.predicateAddress).to.be.equal('custom');
    });

    test('Should instantiate a newest predicate', async () => {
      const latestVersion = Utils.getLatestVersion();

      const evmConnector = new EVMWalletConnector({
        ethProvider,
        fuelProvider,
      });

      await evmConnector.connect();

      expect(evmConnector.predicateAddress).to.be.equal(latestVersion);
    });

    test('Should instantiate a predicate with balance', async () => {
      const ALT_ASSET_ID =
        '0x0101010101010101010101010101010101010101010101010101010101010101';
      const version =
        '0x25acef54b039107f213125f567991d98e0c83dc3be8cf5a984394b1960c055ac';

      const accounts = ethProvider.getAccounts();

      const predicateAccount = new PredicateAccount(
        VERSIONS[version].predicate,
      );
      const ethAccount1 = accounts[0] as string;

      let connector = new EVMWalletConnector({
        ethProvider,
        fuelProvider,
        predicateConfig: VERSIONS[version].predicate,
      });

      const createdPredicate = predicateAccount.createPredicate(
        ethAccount1,
        fuelProvider,
      );

      const fundingWallet = new WalletUnlocked('0x01', fuelProvider);

      // Transfer base asset coins to predicate
      await fundingWallet
        .transfer(createdPredicate.address, 1_000_000, baseAssetId, {
          gasLimit: 10000,
          maxFee: MAX_FEE,
        })
        .then((resp) => resp.wait());
      // Transfer alt asset coins to predicate
      await fundingWallet
        .transfer(createdPredicate.address, 1_000_000, ALT_ASSET_ID, {
          gasLimit: 10000,
          maxFee: MAX_FEE,
        })
        .then((resp) => resp.wait());

      // Check predicate balances
      const predicateETHBalanceInitial = await createdPredicate.getBalance();
      const predicateAltBalanceInitial =
        await createdPredicate.getBalance(ALT_ASSET_ID);

      // Check predicate has the balance required
      expect(predicateETHBalanceInitial.gte(1000000));
      expect(predicateAltBalanceInitial.gte(1000000));

      connector = new EVMWalletConnector({
        ethProvider,
        fuelProvider,
      });

      await connector.connect();

      expect(connector.predicateAddress).to.be.equal(version);
    });
  });

  describe('assets()', () => {
    test('returns an empty array', async () => {
      const connector = new EVMWalletConnector({
        ethProvider,
        fuelProvider,
      });

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

      const connector = new EVMWalletConnector({
        ethProvider,
        fuelProvider,
      });

      await expect(() => connector.addAsset(asset)).rejects.toThrowError(
        'Method not implemented.',
      );
    });
  });

  describe('addAssets()', () => {
    test('throws error', async () => {
      const connector = new EVMWalletConnector({
        ethProvider,
        fuelProvider,
      });

      await expect(() => connector.addAssets([])).rejects.toThrowError(
        'Method not implemented.',
      );
    });
  });

  describe('addAbi()', () => {
    test('throws error', async () => {
      const connector = new EVMWalletConnector({
        ethProvider,
        fuelProvider,
      });

      await expect(() => connector.addAbi({})).rejects.toThrowError(
        'Method not implemented.',
      );
    });
  });

  describe('getAbi()', () => {
    test('throws error', async () => {
      const connector = new EVMWalletConnector({
        ethProvider,
        fuelProvider,
      });

      await expect(() => connector.getAbi('contractId')).rejects.toThrowError(
        'Cannot get contractId ABI for a predicate',
      );
    });
  });

  describe('hasAbi()', () => {
    test('throws error', async () => {
      const connector = new EVMWalletConnector({
        ethProvider,
        fuelProvider,
      });

      await expect(() => connector.hasAbi('contractId')).rejects.toThrowError(
        'A predicate account cannot have an ABI',
      );
    });
  });

  describe('network()', () => {
    test('returns the fuel network info', async () => {
      const connector = new EVMWalletConnector({
        ethProvider,
        fuelProvider,
      });

      const network = await connector.currentNetwork();

      expect(network.chainId.toString()).to.be.equal(
        fuelProvider.getChainId().toString(),
      );
      expect(network.url).to.be.equal(fuelProvider.url);
    });
  });

  describe('networks()', () => {
    test('returns an array of fuel network info', async () => {
      const connector = new EVMWalletConnector({
        ethProvider,
        fuelProvider,
      });

      const networks = await connector.networks();
      const network = networks.pop();

      const networkChainId = network?.chainId.toString();
      const expectedChainId = fuelProvider.getChainId().toString();
      expect(networkChainId).to.be.equal(expectedChainId);

      expect(network?.url).to.be.equal(fuelProvider.url);
    });
  });

  describe('addNetwork()', () => {
    test('throws error', async () => {
      const connector = new EVMWalletConnector({
        ethProvider,
        fuelProvider,
      });

      await expect(() => connector.addNetwork('')).rejects.toThrowError(
        'Method not implemented.',
      );
    });
  });
});
