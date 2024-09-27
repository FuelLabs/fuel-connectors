import { styled } from 'styled-components';

export const ConnectorTitle = styled.h2`
  text-align: center;
  font-size: 1.2em;
  font-weight: 500;
  color: var(--fuel-color-bold);
  margin: 0 0 0.4em 0;
  padding: 0 1.8em;
`;

export const ConnectorDescription = styled.p`
  font-weight: 400;
  text-align: center;
  margin: 0 1.2em;
  line-height: 1.2em;
  padding: 0 2em;
  opacity: 0.8;
`;

export const ConnectorFooterHelper = styled.p`
  font-size: 0.8em;
  font-weight: 400;
  text-align: center;
  margin: 0.6em 1.2em;
  line-height: 1.2em;
  padding: 0 2em;
  opacity: 0.5;
`;

export const ConnectorDescriptionError = styled(ConnectorDescription)`
  color: var(--fuel-color-error);
`;

export const ConnectorImage = styled.div`
  display: flex;
  justify-content: center;
  height: 6.2em;
  width: 100%;
  margin-top: 1.6em;
  margin-bottom: 1.2em;
`;

export const ConnectorButton = styled.a`
  display: flex;
  box-sizing: border-box;
  text-decoration: none;
  cursor: pointer;
  justify-content: center;
  align-items: center;
  margin: 0.4rem 1rem 0;
  padding: 0.6rem 0;
  font-size: 0.875em;
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

export const ConnectorContent = styled.div`
  display: flex;
  flex-direction: column;
  margin-bottom: 24px;
`;

export const ConnectorButtonPrimary = styled(ConnectorButton)`
  background-color: var(--fuel-green-11);
  color: var(--fuel-black-color);

  &:visited {
    color: var(--fuel-black-color);
  }

  &:hover {
    background-color: var(--fuel-green-11);
  }
`;
