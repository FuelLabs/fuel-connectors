import type { FuelConnector, Provider } from 'fuels';

export async function hasBalance(
  connector: FuelConnector,
  provider: Provider,
  chainId?: number,
) {
  const account = await connector.currentAccount();
  const chainInfo = await provider?.getChain();
  const correctChain =
    chainId != null
      ? chainId === chainInfo?.consensusParameters.chainId.toNumber()
      : true;

  if (account && chainInfo && correctChain) {
    const balance = await provider?.getBalance(
      account,
      chainInfo?.consensusParameters.baseAssetId,
    );
    return !balance?.isZero();
  }

  return true;
}
