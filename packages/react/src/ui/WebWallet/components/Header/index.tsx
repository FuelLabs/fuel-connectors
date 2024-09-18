import { EntityItem, EntityItemInfo, EntityItemSlot } from '@fuels/ui';
import { AvatarGenerated } from '../AvatarGenerated';

export interface HeaderProps {
  address: string;
  title?: string;
}

export const Header = ({ address, title }: HeaderProps) => {
  return (
    <EntityItem gap="0">
      <EntityItemSlot>
        <AvatarGenerated size="2" hash={address} />
      </EntityItemSlot>
      <EntityItemInfo id={address} title={title ?? 'Your Wallet'} />
    </EntityItem>
  );
};
