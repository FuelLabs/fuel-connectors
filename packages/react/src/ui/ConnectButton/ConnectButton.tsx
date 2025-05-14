import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import {
  useAccount,
  useConnect,
  useDisconnect,
  useIsConnected,
} from '../../hooks';
import { useFuel } from '../../providers/FuelHooksProvider';
import { Routes, useConnectUI } from '../../providers/FuelUIProvider';
import type { ConnectButtonProps } from '../../types';
import { Icon } from '../Icon';
import { Menu } from '../Menu';
import { getIcons } from './getIcons';

export function ConnectButton({
  label = 'Connect Wallet',
  onConnectClick,
  onDisconnectClick,
  ...buttonProps
}: ConnectButtonProps) {
  const { account } = useAccount();
  const { disconnect } = useDisconnect();
  const { connect } = useConnect();
  const { isConnected } = useIsConnected();
  const { networks } = useFuel();
  const {
    dialog: { setRoute },
  } = useConnectUI();

  const handleConnectClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    if (onConnectClick) {
      onConnectClick();
      return;
    }
    connect();
  };

  const handleDisconnectClick = (e: React.MouseEvent<HTMLElement>) => {
    e.preventDefault();
    if (onDisconnectClick) {
      onDisconnectClick();
      return;
    }
    disconnect();
  };

  const handleShowPredicateVersions = (e: React.MouseEvent<HTMLElement>) => {
    e.preventDefault();
    setRoute(Routes.PredicateVersionSelector);
  };

  function truncateAddress(address: string) {
    return `${address.substring(0, 6)}...${address.substring(
      address.length - 4,
    )}`;
  }

  const addressParts = account?.split('fuel');
  if (addressParts && addressParts.length > 1 && addressParts[1]) {
    for (const predicate of ['0x', 'predicate', 'contract']) {
      if (addressParts[1].startsWith(predicate)) {
        return (
          <Menu
            buttonVariant="primary"
            triggerDisabled
            triggerClassName="connect-button"
            {...buttonProps}
            buttonChildren={
              <div className="fuel-connector-address">
                {truncateAddress(account)}
              </div>
            }
          >
            <Menu.Item onClick={handleDisconnectClick}>Disconnect</Menu.Item>
            <Menu.Item onClick={handleShowPredicateVersions}>
              Predicate Versions
            </Menu.Item>
          </Menu>
        );
      }
    }
  }

  if (isConnected) {
    return (
      <DropdownMenu.Root>
        <DropdownMenu.Trigger
          className="connect-button fuel-connected-button"
          {...buttonProps}
        >
          <div className="fuel-connector-address">
            {account && truncateAddress(account)}
          </div>
        </DropdownMenu.Trigger>
        <Menu.Content>
          <Menu.Item onClick={handleDisconnectClick}>Disconnect</Menu.Item>
          <Menu.Item onClick={handleShowPredicateVersions}>
            Predicate Versions
          </Menu.Item>
        </Menu.Content>
      </DropdownMenu.Root>
    );
  }

  return (
    <button
      type="button"
      className="connect-button"
      onClick={handleConnectClick}
      {...buttonProps}
    >
      <Icon
        icon={getIcons(networks[0].chainId, 'default')}
        size={28}
        color="#fff"
      />
      <span>{label}</span>
    </button>
  );
}
