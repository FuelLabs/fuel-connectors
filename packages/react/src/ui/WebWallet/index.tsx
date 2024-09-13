import {
  Button,
  Container,
  EntityItem,
  EntityItemInfo,
  EntityItemSlot,
  Flex,
  Icon,
  Inset,
  Popover,
  ScrollArea,
  Separator,
  VStack,
  shortAddress,
} from '@fuels/ui';
import { type Asset, bn } from 'fuels';
import { useEffect, useState } from 'react';
import {
  useAccount,
  useAssets,
  useCurrentConnector,
  useDisconnect,
  useIsConnected,
  useWallet,
} from '../../hooks';
import { Anchor, Assets, Balance } from './components';
import { Overlay } from './styles';
import '@fuels/ui/styles.css';
import './index.css';
import { IconHistory, IconLogout } from '@tabler/icons-react';
import { IconX } from '@tabler/icons-react';
import { AvatarGenerated } from './components/AvatarGenerated';
import { useGenerateBackground } from './hooks/useGenerateBackground';
import { type IAssetsBalance, defaultAssetsBalance } from './types';

export const WebWallet = () => {
  const [address, setAddress] = useState('');
  const [balance, setBalance] = useState(bn(0));
  const [hideAmount, setHideAmount] = useState(false);
  const [assetsBalances, setAssetsBalances] = useState<IAssetsBalance[]>([]);
  const [isFetchedBalance, setFetchedBalance] = useState(false);

  const { isConnected } = useIsConnected();
  const { disconnect } = useDisconnect();
  const {
    account,
    isFetched: isFetchedAccount,
    refetch: refetchAccount,
  } = useAccount();
  const {
    assets,
    isFetched: isFetchedAssets,
    refetch: refetchAssets,
  } = useAssets();
  const {
    wallet,
    isFetched: isFetchedWallet,
    refetch: refetchWallet,
  } = useWallet();
  const {
    connector,
    isFetched: isFetchedConnector,
    refetch,
  } = useCurrentConnector();

  const getAssetId = (asset: Asset) => {
    return asset.networks?.find((n) => n.type === 'fuel')?.assetId;
  };

  const toggleHideAmount = () => {
    setHideAmount(!hideAmount);
  };

  useEffect(() => {
    if (isConnected) {
      refetch();
      refetchAccount();
      refetchAssets();
      refetchWallet();
      setFetchedBalance(false);
    }
  }, [isConnected, refetch, refetchAccount, refetchAssets, refetchWallet]);

  useEffect(() => {
    if (!isConnected) {
      setAddress('');
      setBalance(bn(0));
      setAssetsBalances([]);
      setFetchedBalance(false);
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
          setAssetsBalances(
            enrichedAssets.length === 0 ? defaultAssetsBalance : enrichedAssets,
          );
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
    if (assetsBalances.length > 0 && !isFetchedBalance) {
      const balance =
        assetsBalances.find((ab) => ab.symbol === 'ETH')?.amount ??
        assetsBalances.length === 1
          ? assetsBalances[0].amount
          : assetsBalances.reduce((acc, ab) => acc.add(ab.amount), bn(0));
      setBalance(balance);
      setFetchedBalance(true);
    }
  }, [assetsBalances, isFetchedBalance]);

  useEffect(() => {
    if (isFetchedAccount && account && address === '') {
      setAddress(account);
    }
  }, [account, isFetchedAccount, address]);

  const isLoading =
    !isFetchedAccount ||
    !isFetchedWallet ||
    !isFetchedAssets ||
    !isFetchedConnector ||
    !isFetchedBalance;

  // Fixes an issue where the Tooltip would be the focused element
  const preventAutoFocus = (e: Event) => {
    e.preventDefault();
  };

  if (!isConnected) {
    return null;
  }
  return (
    <Overlay>
      <Popover>
        <Popover.Trigger>
          <Anchor
            address={shortAddress(address)}
            isLoading={isLoading}
            isConnected={isConnected}
          />
        </Popover.Trigger>
        <Popover.Content
          width={{
            initial: '100vw',
            md: '370px',
          }}
          maxWidth={{
            initial: '100%',
            md: '370px',
          }}
          maxHeight={{
            initial: '90vh',
            md: '50vh',
          }}
          sticky="partial"
          onOpenAutoFocus={preventAutoFocus}
        >
          <VStack gap="3">
            <EntityItem gap="0">
              <EntityItemSlot>
                <AvatarGenerated
                  fallback=""
                  size="2"
                  background={useGenerateBackground(address)}
                />
              </EntityItemSlot>
              <EntityItemInfo id={address} title={connector?.name} />
            </EntityItem>
            <Inset side="x">
              <Separator size="4" />
            </Inset>

            <Inset side="x">
              <ScrollArea scrollbars="vertical" type="auto">
                <VStack
                  gap="3"
                  maxHeight={{
                    initial: 'calc(100vh - 220px)',
                    md: 'calc(50vh - 200px)',
                  }}
                  px="var(--popover-content-padding)"
                >
                  <Balance
                    value={balance}
                    hideAmount={hideAmount}
                    toggleHideAmount={toggleHideAmount}
                  />
                  <Separator size="4" style={{ minHeight: '1px' }} />
                  <Assets assets={assetsBalances} hideAmount={hideAmount} />
                </VStack>
              </ScrollArea>
            </Inset>
            <Inset side="x">
              <Separator size="4" />
            </Inset>

            <Popover.Close>
              <Flex gap="1">
                <Button
                  as="a"
                  href={`https://app.fuel.network/account/${address}/transactions`}
                  target="_blank"
                  rel="noreferrer"
                  size="2"
                  leftIcon={IconHistory}
                  color="gray"
                  className="flex-1"
                >
                  History
                </Button>
                <Button
                  color="red"
                  size="2"
                  leftIcon={IconLogout}
                  onClick={() => disconnect()}
                  className="flex-1"
                >
                  Disconnect
                </Button>
                <Container
                  display={{
                    lg: 'none',
                  }}
                  className="absolute top-0 right-0"
                  style={{
                    padding: 'var(--space-4)',
                  }}
                >
                  <Icon icon={IconX} size={24} />
                </Container>
              </Flex>
            </Popover.Close>
          </VStack>
        </Popover.Content>
      </Popover>
    </Overlay>
  );
};
