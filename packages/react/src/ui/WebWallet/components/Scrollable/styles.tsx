import { styled } from 'styled-components';

export const ScrollableWrapper = styled.div`
  overflow-y: auto;
  max-height: 100%;
  flex: 1;

  scroll-behavior: smooth;

  &::-webkit-scrollbar {
    width: 6px;
    background-color: transparent;
  }
  &::-webkit-scrollbar-track {
    background-color: transparent;
  }
  &::-webkit-scrollbar-thumb {
    background-color: var(--fuel-color-muted);
    opacity: 0.7; /* Increase opacity */
    border: none; /* Remove border */
    border-radius: 12px;
  }
  &::-webkit-scrollbar-thumb:hover {
    background-color: var(--fuel-color);
  }
`;

export const ScrollableContent = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
`;
