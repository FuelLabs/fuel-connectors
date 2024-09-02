import styled from 'styled-components';

export interface ISeparatorProps {
  color: string;
  type: 'dashed' | 'solid';
}
export const Separator = styled.div<ISeparatorProps>`
  width: 100%;
  height: 1px;
  margin: 15px 0;
  border-bottom-width: thin;
  border-bottom-style: ${(props) => props.type};
  border-bottom-color: ${(props) => props.color};
`;
