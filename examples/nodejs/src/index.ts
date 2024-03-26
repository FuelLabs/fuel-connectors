import { FuelWalletConnector } from '@fuels/connectors';
import { Fuel, Mnemonic, WalletManager } from 'fuels';

const main = async () => {
  // Mnemonic
  const WALLET_PASSWORD = 'Qwe1234567$';
  const mnemonic = Mnemonic.generate(16);

  // Vault with initial account
  const manager = new WalletManager();
  await manager.unlock(WALLET_PASSWORD);
  await manager.addVault({
    title: '@fuels/connectors',
    type: 'mnemonic',
    secret: mnemonic,
  });

  // Adding second account
  await manager.addAccount({ vaultId: 0 });

  // Listing accounts
  const accounts = manager.getAccounts();
  console.log('mnenomic\n', mnemonic, '\n\naccounts');
  console.log(accounts.map((ac) => ac.address.toString()));

  // Listing available connectors
  const fuel = new Fuel({
    connectors: [new FuelWalletConnector()], // Build and check "dist" to confirm only this connector was bundled
  });
  const connectors = await fuel.connectors();
  console.log(
    '\navailable connectors\n',
    connectors.map((c) => c.name),
  );
};

main();
