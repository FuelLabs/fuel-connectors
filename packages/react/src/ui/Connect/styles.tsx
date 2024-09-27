import * as Dialog from '@radix-ui/react-dialog';
import { keyframes, styled } from 'styled-components';

import { BackIcon as CBackIcon } from '../../icons/BackIcon';
import { CloseIcon as CCloseIcon } from '../../icons/CloseIcon';

const placeholderLoader = keyframes`
  0%{
    background-position: -468px 0
  }
  100%{
    background-position: 468px 0
  }
`;

export const DialogHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-left: 16px;
  padding-right: 16px; 
`;

export const DialogTitle = styled(Dialog.Title)`
  padding: 8px 14px 12px;
  margin: 0;
  text-align: center;
  font-size: var(--fuel-font-size);
  font-weight: 500;
`;

export const Divider = styled.div`
  height: 1px;
  width: 100%;
  background-color: var(--fuel-border-color);
  margin: 10px 0;
  padding: 0;
  box-sizing: border-box;
`;

export const DialogMain = styled.div`
  position: relative;
  overflow-y: auto;
`;

export const BackIcon = styled(CBackIcon)`
  fill: var(--fuel-color);
  padding: 7px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;

  &[data-connector='false'] {
    visibility: hidden;
  }

  &:hover,
  &:active {
    background-color: var(--fuel-connector-hover);
    opacity: 1;
  }
`;

export const CloseIcon = styled(CCloseIcon)`
  fill: var(--fuel-color);
  padding: 7px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;

  &:hover,
  &:active {
    background-color: var(--fuel-connector-hover);
    opacity: 1;
  }
`;

export const PlaceholderLoader = styled.div`
  animation-duration: 1s;
  animation-fill-mode: forwards;
  animation-iteration-count: infinite;
  animation-name: ${placeholderLoader};
  animation-timing-function: linear;
  background: #d1d5d9;
  background: var(--fuel-loader-background);
  background-size: 1000px 104px;
  height: fit-content;
  position: relative;
  overflow: hidden;
  color: transparent !important;
  pointer-events: none !important;
`;
