import { Provider, WalletUnlocked } from 'fuels';
import { CounterContractAbi__factory } from '../src/contracts';
import bytecode from '../src/contracts/CounterContractAbi.hex';

export const TESTNET_URL = 'https://testnet.fuel.network/v1/graphql';
const provider = await Provider.create(TESTNET_URL);
const wallet = new WalletUnlocked(
  '0x9205c87dce80746d467a08b88927ac0377e132ac81012cd453a7674b904c2c16',
  provider,
);
const contract = await CounterContractAbi__factory.deployContract(
  bytecode,
  wallet,
);
console.log('contract.id', contract.id);
