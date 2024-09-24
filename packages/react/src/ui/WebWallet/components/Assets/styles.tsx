import { IconCopy } from '@tabler/icons-react';
import { styled } from 'styled-components';

export const AssetsWrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

export const AssetsTitleWrapper = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
`;

export const AssetsTitle = styled.div``;

export const AssetsList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

export const AssetCard = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 12px;
  border-radius: 12px;
  background-color: var(--fuel-card-background);
  border: var(--fuel-border);
`;

export const AssetCardLeft = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
`;

export const AssetCardAssetInfoWrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

export const AssetCardAssetInfoName = styled.div`
  font-size: var(--fuel-font-size-sm);
`;
export const AssetCardAssetInfoSymbolWrapper = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  color: var(--fuel-color-muted);
  font-size: var(--fuel-font-size-sm);
`;
export const AssetCardAssetInfoSymbol = styled.div``;

export const AssetCardValue = styled.div`
  font-size: var(--fuel-font-size-sm);
`;
