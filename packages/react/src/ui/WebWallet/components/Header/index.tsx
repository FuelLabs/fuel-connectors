import type { ConnectorMetadata, FuelConnector } from 'fuels';
import { shortAddress } from '../../../../utils';
import { getImageUrl } from '../../../Connect/utils/getImageUrl';
import { CopyButton } from '../CopyButton';
import {
  ConnectorLogo,
  HeaderConnected,
  HeaderWalletAddress,
  HeaderWalletAddressWrapper,
  HeaderWalletTitle,
  HeaderWrapper,
} from './styles';

export interface HeaderProps {
  address: string;
  currentConnector: FuelConnector | null | undefined;
}

export const Header = ({ address, currentConnector }: HeaderProps) => {
  const metadata = currentConnector
    ? currentConnector.metadata
    : ({} as ConnectorMetadata);
  return (
    <HeaderWrapper>
      <ConnectorLogo src={getImageUrl(metadata)} />
      <HeaderConnected>
        <HeaderWalletTitle>
          {currentConnector?.name ?? 'Your Wallet'}
        </HeaderWalletTitle>
        <HeaderWalletAddressWrapper>
          <HeaderWalletAddress>{shortAddress(address)}</HeaderWalletAddress>
          <CopyButton size={18} address={address} />
        </HeaderWalletAddressWrapper>
      </HeaderConnected>
    </HeaderWrapper>
  );
};
