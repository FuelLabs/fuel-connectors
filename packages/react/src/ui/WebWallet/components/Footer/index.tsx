import { IconX } from '@tabler/icons-react';
import { DisconnectButton } from '../DisconnectButton';
import { HistoryButton } from '../HistoryButton';
import { FooterContent, FooterWrapper } from './styles';

export interface FooterProps {
  address: string;
  disconnect: () => void;
}

export const Footer = ({ address: _a, disconnect: _d }: FooterProps) => {
  // return 'FOOTER';
  return (
    <FooterWrapper>
      <FooterContent>
        <HistoryButton address={_a} />
        <DisconnectButton disconnect={_d} />
      </FooterContent>
    </FooterWrapper>
  );
  // return (
  //   <Flex gap="1">
  //     <HistoryButton address={address} />
  //     <DisconnectButton disconnect={disconnect} />
  //     <Container className="absolute top-0 right-0 lg:hidden p-4">
  //       <Icon icon={IconX} size={24} />
  //     </Container>
  //   </Flex>
  // );
};
