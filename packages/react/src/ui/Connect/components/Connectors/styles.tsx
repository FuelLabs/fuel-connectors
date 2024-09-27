import { styled } from 'styled-components';

export const ConnectorItem = styled.div`
  display: flex;
  align-items: center;
  background-color: var(--fuel-connector-background);
  box-sizing: border-box;
  cursor: pointer;
  width: 100%;
  color: var(--fuel-font-color);
  gap: var(--fuel-items-gap);
  padding: 0.8em;
  border-radius: 16px;
  letter-spacing: var(--fuel-letter-spacing);
  font-weight: 400;
  transition: background-color opacity 50ms cubic-bezier(0.16, 1, 0.3, 1);

  &:active {
    opacity: 0.8;
  }
  &:hover {
    background-color: var(--fuel-connector-hover);
  }
`;

export const ConnectorList = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--fuel-items-gap);
  padding: 0px 14px;
`;

export const ConnectorName = styled.div`
  font-size: var(--fuel-font-size);
`;

export const ConnectorImg = styled.img`
  object-fit: cover;
`;

const Badge = styled.div`
  border-radius: var(--fuel-border-radius);
  font-size: var(--fuel-font-size-xs);
  padding: 2px 8px;
  text-transform: uppercase;
  margin-left: auto;
`;

export const BadgeInfo = styled(Badge)`;
  background-color: var(--fuel-blue-3);
  color: var(--fuel-blue-11);
`;

export const BadgeSuccess = styled(Badge)`;
  background-color: var(--fuel-green-3);
  color: var(--fuel-green-11);
`;

export const GroupTitle = styled.p`
  width: 100%;
  color: #797979;
  font-size: var(--fuel-font-size-xs);
  font-style: normal;
  font-weight: 400;
  margin: 0;
`;

export const GroupLastTitle = styled(GroupTitle)`
  margin-top: 14px;
`;
