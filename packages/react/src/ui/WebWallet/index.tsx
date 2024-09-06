import {
  Button,
  EntityItem,
  EntityItemInfo,
  HStack,
  Heading,
  Popover,
  Separator,
  VStack,
  shortAddress,
} from '@fuels/ui';
import { type BN, type CoinQuantity, bn } from 'fuels';
import { useEffect, useState } from 'react';
import {
  useAccount,
  useDisconnect,
  useIsConnected,
  useWallet,
} from '../../hooks';
import { Anchor, Assets, Balance } from './components';
import { Overlay } from './styles';
import '@fuels/ui/styles.css';
import { IconHistory, IconLogout } from '@tabler/icons-react';

export const WebWallet = () => {
  const [address, setAddress] = useState('');
  const [balance, setBalance] = useState('');
  const [assetsBalances, setAssetsBalances] = useState<CoinQuantity[]>([]);

  const { account, isFetched: isFetchedAccount } = useAccount();
  const { isConnected } = useIsConnected();
  const { disconnect } = useDisconnect();
  const { wallet, isFetched: isFetchedWallet } = useWallet();

  const disconnectWallet = () => {
    disconnect();
  };

  useEffect(() => {
    if (!isConnected) {
      setAddress('');
      setBalance('');
      setAssetsBalances([]);
    }
  }, [isConnected]);

  useEffect(() => {
    if (isFetchedWallet && wallet) {
      wallet
        .getBalances()
        .then(({ balances }) => {
          setAssetsBalances(balances);
        })
        .catch(console.error);
    }
  }, [wallet, isFetchedWallet]);

  useEffect(() => {
    if (assetsBalances.length > 0) {
      const balance = assetsBalances
        .reduce((acc: BN, { amount }) => {
          return acc.add(amount ?? bn(0));
        }, bn(0))
        .format();
      setBalance(balance);
    }
  }, [assetsBalances]);

  useEffect(() => {
    if (isFetchedAccount && account) {
      setAddress(account);
    }
  }, [account, isFetchedAccount]);

  const isLoading = !isFetchedAccount || !isFetchedWallet || balance === '';

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
          <VStack gap="3" minHeight={{ md: '400px', xl: '400px' }}>
            <EntityItem>
              <EntityItemInfo id={address} title="Your Wallet" />
            </EntityItem>
            <Balance value={balance} />
            <Separator size="4" />
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
