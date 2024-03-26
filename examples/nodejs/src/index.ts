import { Mnemonic, WalletManager } from 'fuels';

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
  console.log(mnemonic);
  console.log(accounts.map((ac) => ac.address.toString()));
};

main();
