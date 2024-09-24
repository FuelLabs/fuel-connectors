import styled, { keyframes } from 'styled-components';

interface SpinnerProps {
  size: number;
  color: string;
}

const spinAnimation = keyframes`
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
`;

export const Spinner = styled.div<SpinnerProps>`
  height: ${({ size }) => size}px;
  width: ${({ size }) => size}px;
  border: 4px solid rgba(0, 0, 0, 0.1);
  border-top-color: ${({ color }) => color};
  border-radius: 50%;
  animation: ${spinAnimation} 1s infinite linear;
`;
