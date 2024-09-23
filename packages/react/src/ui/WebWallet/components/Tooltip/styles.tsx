import styled from 'styled-components';

export const TooltipWrapper = styled.div`
  position: relative;
  display: inline-block;
`;

export const TooltipContent = styled.div`
  visibility: visible;
  width: 300px;
  background-color: black;
  color: #fff;
  text-align: center;
  padding: 5px 0;
  border-radius: 6px;
  bottom: 100%;
  left: 50%;
  margin-left: -150px;
  position: absolute;
  z-index: 3;

  &::after {
    content: " ";
    position: absolute;
    top: 100%;
    left: 50%;
    margin-left: -10px;
    border-width: 10px;
    border-style: solid;
    border-color: black transparent transparent transparent;
  }

  ${TooltipWrapper}:hover & {
    visibility: visible;
  }
`;

export const TooltipText = styled.div`
  color: var(--fuel-color);
  padding: 8px;
  text-overflow: ellipsis;
  white-space: nowrap;
  width: 100%;
  overflow: hidden;
`;
