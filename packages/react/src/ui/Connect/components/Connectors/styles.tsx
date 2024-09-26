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
  font-weight: 500;
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

export const GroupLastTitle = styled.p`
  color: #797979;
  font-family: Inter;
  font-size: 13px;
  font-style: normal;
  font-weight: 400;
  line-height: 20px;
  letter-spacing: -0.13px;
`;

export const GroupFirstTitleContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;
  justify-content: flex-start;
  width: 100%;
  padding-left: 3px;
  margin-bottom: 7px;
`;

export const GroupLastTitleContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;
  justify-content: flex-start;
  width: 100%;
  padding-left: 3px;
  margin: 14px 0px 7px 0px;
`;
