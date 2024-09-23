import { styled } from 'styled-components';

export const BalanceWrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2px;
  padding: 0 16px;
`;

export const BalanceTitle = styled.div`
  color: var(--fuel-color-muted);
  font-size: var(--fuel-font-size-sm);
`;

export const BalanceValueRow = styled.div`
  font-size: var(--fuel-font-size-lg);
  display: flex;
  align-items: center;
  gap: 12px;
  letter-spacing: var(--fuel-letter-spacing-lg);
`;

export const BalanceValue = styled.div`
  color: var(--fuel-color);
`;
