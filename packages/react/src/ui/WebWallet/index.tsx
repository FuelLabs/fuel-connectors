import {
  Button,
  EntityItem,
  EntityItemInfo,
  EntityItemSlot,
  HStack,
  Inset,
  Popover,
  Separator,
  VStack,
  shortAddress,
} from '@fuels/ui';
import { type Asset, type BN, type CoinQuantity, bn } from 'fuels';
import { useEffect, useState } from 'react';
import {
  useAccount,
  useAssets,
  useDisconnect,
  useIsConnected,
  useWallet,
} from '../../hooks';
import { Anchor, Assets, Balance } from './components';
import { Overlay } from './styles';
import '@fuels/ui/styles.css';
import { IconHistory, IconLogout } from '@tabler/icons-react';
import { AvatarGenerated } from './components/AvatarGenerated';
import { useGenerateBackground } from './hooks/useGenerateBackground';
import type { IAssetsBalance } from './types';

export const WebWallet = () => {
  const [address, setAddress] = useState('');
  const [balance, setBalance] = useState('');
  const [assetsBalances, setAssetsBalances] = useState<IAssetsBalance[]>([]);

  const { isConnected } = useIsConnected();
  const { disconnect } = useDisconnect();
  const { account, isFetched: isFetchedAccount } = useAccount();
  const { assets, isFetched: isFetchedAssets } = useAssets();
  const { wallet, isFetched: isFetchedWallet } = useWallet();

  const disconnectWallet = () => {
    disconnect();
  };

  const getAssetId = (asset: Asset) => {
    return asset.networks?.find((n) => n.type === 'fuel')?.assetId;
  };

  useEffect(() => {
    if (!isConnected) {
      setAddress('');
      setBalance('');
      setAssetsBalances([]);
    }
  }, [isConnected]);

  useEffect(() => {
    if (
      isFetchedWallet &&
      wallet &&
      isFetchedAssets &&
      assetsBalances.length === 0
    ) {
      wallet
        .getBalances()
        .then(({ balances }) => {
          const enrichedAssets = balances.map<IAssetsBalance>((balance) => {
            const asset = assets.find(
              (asset) => getAssetId(asset) === balance.assetId,
            );
            return {
              name: asset?.name ?? 'Unknown',
              symbol: asset?.symbol ?? 'UNK',
              icon: asset?.icon ?? '',
              amount: balance.amount ?? bn(0),
              id: balance.assetId,
            } as IAssetsBalance;
          });
          setAssetsBalances(enrichedAssets);
        })
        .catch(console.error);
    }
  }, [
    wallet,
    isFetchedWallet,
    isFetchedAssets,
    assets,
    getAssetId,
    assetsBalances,
  ]);

  useEffect(() => {
    if (assetsBalances.length > 0 && balance === '') {
      const balance =
        assetsBalances.find((ab) => ab.symbol === 'ETH')?.amount.format() ??
        bn(0).format();
      setBalance(balance);
    }
  }, [assetsBalances, balance]);

  useEffect(() => {
    if (isFetchedAccount && account && address === '') {
      setAddress(account);
    }
  }, [account, isFetchedAccount, address]);

  const isLoading =
    !isFetchedAccount || !isFetchedWallet || !isFetchedAssets || balance === '';

  // Fixes an issue where the Tooltip would be the focused element
  const preventAutoFocus = (e: Event) => {
    e.preventDefault();
  };

  return (
    <Overlay>
      <Popover className="mr-4 rounded-md right-12 bottom-12">
        <Popover.Trigger>
          <Anchor
            address={shortAddress(address)}
            isLoading={isLoading}
            isConnected={isConnected}
          />
        </Popover.Trigger>
        <Popover.Content
          side="top"
          sticky="always"
          onOpenAutoFocus={preventAutoFocus}
        >
          <VStack
            gap="3"
            minHeight={{ md: '400px', xl: '400px' }}
            minWidth={{
              md: '300px',
              xl: '300px',
            }}
          >
            <EntityItem gap="0">
              <EntityItemSlot>
                <AvatarGenerated
                  fallback=""
                  size="2"
                  background={useGenerateBackground(address)}
                />
              </EntityItemSlot>
              <EntityItemInfo id={address} title="Your Wallet" />
            </EntityItem>
            <Inset side="x">
              <Separator size="4" />
            </Inset>
            <Balance value={balance} />
            <Inset side="x">
              <Separator size="4" />
            </Inset>
            <Assets assets={assetsBalances} />

            <Popover.Close>
              <HStack mt="auto" justify="end" gap="1">
                <Button
                  as="a"
                  href={`https://app.fuel.network/account/${address}/transactions`}
                  target="_blank"
                  rel="noreferrer"
                  variant="outline"
                  size="1"
                  leftIcon={IconHistory}
                  radius="full"
                >
                  History
                </Button>
                <Button
                  color="red"
                  variant="outline"
                  size="1"
                  leftIcon={IconLogout}
                  radius="full"
                  onClick={() => disconnectWallet()}
                >
                  Disconnect
                </Button>
              </HStack>
            </Popover.Close>
          </VStack>
        </Popover.Content>
      </Popover>
    </Overlay>
  );
};
