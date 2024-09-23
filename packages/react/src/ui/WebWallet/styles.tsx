import * as Dialog from '@radix-ui/react-dialog';
import { keyframes, styled } from 'styled-components';

export const Overlay = styled.div`
  position: fixed;
  bottom: 1rem;
  right: 0.5rem;
  z-index: 2;
`;

const overlayShow = keyframes`
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
`;

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

export const DialogOverlay = styled(Dialog.Overlay)`
  position: fixed;
  inset: 0;
  animation: ${overlayShow} 150ms cubic-bezier(0.16, 1, 0.3, 1);
`;

export const DialogContent = styled(Dialog.Content)`
  position: fixed;
  right: 25px;
  bottom: 72px;
  max-width: 370px;
  width: 370px;
  height: 700px;
  border: var(--fuel-border);
  

  overflow: hidden;
  color: var(--fuel-color);
  user-select: none;
  box-sizing: border-box;
  background-color: var(--fuel-dialog-background);
  border-radius: 36px;
  padding-bottom: 18px;
  animation: ${contentShow} 150ms cubic-bezier(0.16, 1, 0.3, 1);
  box-shadow:
    hsl(206 22% 7% / 35%) 0px 10px 38px -10px,
    hsl(206 22% 7% / 20%) 0px 10px 20px -15px;

  &:focus {
    outline: none;
  }

  @media (max-width: 640px) {
    bottom: 0px;
    right: 0px;
    width: 100vw;
    max-width: 100%;
    border-radius: 36px 36px 0 0;
  }
` as unknown as typeof Dialog.Content;

export const DialogTitle = styled(Dialog.Title)`
  padding: 8px 14px 12px;
  margin: 0;
  font-weight: normal;
  text-align: center;
  font-size: 16px;
  letter-spacing: var(--fuel-letter-spacing);
  font-weight: 700;
`;

export const Divider = styled.div`
  height: 1px;
  width: 100%;
  background-color: var(--fuel-border-color);
  padding: 0;
  box-sizing: border-box;
`;

export const DialogMain = styled.div`
  position: relative;
  display: flex;
  flex-direction: column;
  gap: 16px;
  margin-top: 16px;
  height: 100%;
`;

export const FuelRoot = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  bottom: 0;
  right: 0;
  height: 100%;
  width: 100%;
  margin: 0;
  padding: 0;
  z-index: 9999;
  font-size: var(--fuel-font-size);

  & * {
    font-family: var(--fuel-font-family);
  }
`;

export const DialogTrigger = styled(Dialog.Trigger)`
  position: fixed;
  bottom: 30px;
  right: 25px;
  background-color: var(--fuel-color);
  color: var(--fuel-dialog-background);
  padding: 6px 8px;
  border-radius: 16px;
`;

export const DialogClose = styled(Dialog.Close)`
  svg {
    top: 12px;
    right: 12px;
  }
`;
