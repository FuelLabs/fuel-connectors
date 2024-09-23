import styled from 'styled-components';

export const Button = styled.button`
  display: flex;
  flex-direction: row;
  gap: 4px;
  align-items: center;
  justify-content: center;
  flex: 1;
  border: var(--fuel-border-danger);
  border-radius: 5px;
  height: 32px;
  cursor: pointer;
  padding: 0.5rem;
  transition: background-color 0.3s, color 0.3s;
  background-color: var(--fuel-card-background);
  color: var(--fuel-red-11);
  padding: 6px 8px;
  border-radius: 16px;

  &:hover {
    background-color: var(--fuel-red-3);
    color: var(--fuel-color);
  }
`;
