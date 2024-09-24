import { DisconnectButton } from '../DisconnectButton';
import { HistoryButton } from '../HistoryButton';
import { FooterContent, FooterWrapper } from './styles';

export interface FooterProps {
  address: string;
  disconnect: () => void;
}

export const Footer = ({ address, disconnect }: FooterProps) => {
  return (
    <FooterWrapper>
      <FooterContent>
        <HistoryButton address={address} />
        <DisconnectButton disconnect={disconnect} />
      </FooterContent>
    </FooterWrapper>
  );
};
