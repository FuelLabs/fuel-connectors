import { Container, Flex, Icon } from '@fuels/ui';
import { IconX } from '@tabler/icons-react';
import { DisconnectButton } from '../DisconnectButton';
import { HistoryButton } from '../HistoryButton';

export interface FooterProps {
  address: string;
  disconnect: () => void;
}

export const Footer = ({ address, disconnect }: FooterProps) => {
  return (
    <Flex gap="1">
      <HistoryButton address={address} />
      <DisconnectButton disconnect={disconnect} />
      <Container className="absolute top-0 right-0 lg:hidden p-4">
        <Icon icon={IconX} size={24} />
      </Container>
    </Flex>
  );
};
