import styled from 'styled-components';

export interface IButtonProps {
  backgroundColor: string;
  color: string;
  float?: string;
  padding?: string;
}
export const Button = styled.div<IButtonProps>`
  background-color: ${(props) => props.backgroundColor};
  color: ${(props) => props.color};
  border-radius: 15px;
  float: ${(props) => props.float ?? 'none'};
  padding: ${(props) => props.padding ?? '0'};

  &:hover {
    cursor: pointer;
    background-color: #a0a0a0;
  }
`;
