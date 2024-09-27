import * as Dialog from '@radix-ui/react-dialog';
import styled, { keyframes } from 'styled-components';

const overlayShow = keyframes`
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
`;

export const DialogOverlay = styled(Dialog.Overlay)`
  background-color: var(--fuel-overlay-background);
  position: fixed;
  inset: 0;
  animation: ${overlayShow} 150ms cubic-bezier(0.16, 1, 0.3, 1);
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
  z-index: 99;
  font-family: var(--fuel-font-family);
  font-size: var(--fuel-font-size);
  
  & * {
    box-sizing: border-box;
  }
`;
