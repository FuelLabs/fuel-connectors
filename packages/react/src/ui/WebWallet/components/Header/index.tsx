import {
  Copyable,
  EntityItem,
  EntityItemSlot,
  Text,
  VStack,
  shortAddress,
} from '@fuels/ui';
import type { FuelConnector } from 'fuels';
import { tv } from 'tailwind-variants';
import { AvatarGenerated } from '../AvatarGenerated';
import { CurrentConnectorLogo } from '../CurrentConnectorLogo';

export interface HeaderProps {
  address: string;
  currentConnector?: FuelConnector;
}

export const Header = ({ currentConnector, address }: HeaderProps) => {
  const classes = styles();
  return (
    <EntityItem gap="3">
      <EntityItemSlot>
        <CurrentConnectorLogo currentConnector={currentConnector} />
      </EntityItemSlot>
      <VStack gap="0">
        <Text className={classes.title()}>
          {currentConnector?.name ?? 'Your Wallet'}
        </Text>
        <Copyable className={classes.address()} value={address}>
          {shortAddress(address)}
        </Copyable>
      </VStack>
    </EntityItem>
  );
};

const styles = tv({
  slots: {
    address: 'text-sm text-muted',
    title: 'text-lg font-medium text-heading',
  },
});
