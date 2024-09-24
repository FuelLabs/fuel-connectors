import styled from 'styled-components';
import { ConnectorContent } from '../Connector/styles';

export const DisclaimerContainer = styled(ConnectorContent)`
  border-left: 2px solid;
  border-color: #F5CC00;
  margin-left: 1rem;
  box-sizing: border-box;
  font-size: 1em;
`;

export const DisclaimerList = styled.ul`
  font-weight: 400;
  text-align: left;
  margin: 0 1.2em;
  line-height: 1.4em;
  padding: 0 2em;
  opacity: 0.8;
  list-style: disc;

  & > li {
    margin: 0.6em 0;
  }
`;
