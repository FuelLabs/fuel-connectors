import { IconCopy } from '@tabler/icons-react';
import { styled } from 'styled-components';

export const HeaderWrapper = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
  flex-shrink: 0;
`;

export const HeaderConnected = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

export const ConnectorLogo = styled.img`
  width: 42px;
  height: 42px;
`;

export const HeaderWalletTitle = styled.div`
  font-weight: 600;
`;

export const HeaderWalletAddressWrapper = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;

export const HeaderWalletAddress = styled.div`
  color: var(--fuel-color-muted);
  font-size: var(--fuel-font-size-sm);
`;
