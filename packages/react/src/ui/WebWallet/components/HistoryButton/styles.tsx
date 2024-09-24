import styled from 'styled-components';

export const Button = styled.a`
  display: flex;
  flex-direction: row;
  gap: 4px;
  align-items: center;
  justify-content: center;
  flex: 1;
  border: var(--fuel-border);
  height: 32px;
  cursor: pointer;
  transition: background-color 0.3s, color 0.3s;
  background-color: var(--fuel-button-background);
  color: var(--fuel-color);
  border-radius: 16px;

  &:hover {
    background-color: var(--fuel-button-background-hover);
  }
`;
