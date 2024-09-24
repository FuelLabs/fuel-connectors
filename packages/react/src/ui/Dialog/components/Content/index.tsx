import * as Dialog from '@radix-ui/react-dialog';
import { keyframes, styled } from 'styled-components';

const contentShow = keyframes`
  from {
    opacity: 0;
    transform: translate(-50%, -48%) scale(0.96);
  }
  to {
    opacity: 1;
    transform: translate(-50%, -50%) scale(1);
  }
`;

export const DialogContent = styled(Dialog.Content)`
  overflow: hidden;
  color: var(--fuel-color);
  user-select: none;
  max-height: calc(100% - 20px);
  box-sizing: border-box;
  background-color: var(--fuel-dialog-background);
  position: fixed;
  left: 50%;
  transform: translate(-50%, -50%);
  border-radius: 36px;
  padding: 14px 0px;
  padding-bottom: 18px;
  animation: ${contentShow} 150ms cubic-bezier(0.16, 1, 0.3, 1);
  top: 50%;
  width: 360px;
  max-width: calc(100% - 20px);
  box-shadow:
    hsl(206 22% 7% / 35%) 0px 10px 38px -10px,
    hsl(206 22% 7% / 20%) 0px 10px 20px -15px;

  &:focus {
    outline: none;
  }

  @media (max-width: 430px) {
    top: 50%;
    width: 100%;
    border-radius: 36px;
  }
` as unknown as typeof Dialog.Content;
