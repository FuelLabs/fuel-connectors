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

export const AssetsCardList = styled.div`
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

export const NoAssetDescription = styled.p`
  font-weight: 400;
  color: var(--fuel-color-muted);
  font-size: var(--fuel-font-size-sm);
  text-align: center;
  line-height: 1.2em;
`;

export const Button = styled.a`
  display: flex;
  box-sizing: border-box;
  text-decoration: none;
  cursor: pointer;
  justify-content: center;
  align-items: center;
  margin: 0.4rem 1rem 0;
  padding: 0.6rem 0;
  font-size: var(--fuel-font-size);
  color: var(--fuel-color-bold);
  border-radius: var(--fuel-border-radius);
  background-color: var(--fuel-button-background);

  &:visited {
    color: var(--fuel-color-bold);
  }

  &:hover {
    background-color: var(--fuel-button-background-hover);
  }
`;

export const NoAssetButton = styled(Button)`
  background-color: var(--fuel-green-11);
  color: var(--fuel-black-color);

  &:visited {
    color: var(--fuel-black-color);
  }

  &:hover {
    background-color: var(--fuel-green-11);
  }
`;
