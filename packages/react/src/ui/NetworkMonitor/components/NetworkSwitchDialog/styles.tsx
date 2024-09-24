import { css, styled } from 'styled-components';

const defaultButtonBottomMargin = css`
  margin-bottom: 0.2em;
`;
const defaultTextBottomMargin = css`
  margin-bottom: 1.4em;
`;

export const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--fuel-items-gap);
`;

export const Title = styled.h2`
  text-align: center;
  font-size: 1.2em;
  font-weight: 500;
  color: var(--fuel-color-bold);
  line-height: 1;
  ${defaultTextBottomMargin}
`;

export const Divider = styled.div`
  height: 1px;
  width: 100%;
  background-color: var(--fuel-color-light-gray);
  margin: 10px 0;
  box-sizing: border-box;
`;

export const Description = styled.p`
  font-weight: 400;
  text-align: center;
  line-height: 1.2em;
  color: var(--fuel-color-light-gray);
  ${defaultTextBottomMargin}
`;

export const ErrorMessage = styled.div`
  font-weight: 400;
  text-align: center;
  line-height: 1.2em;
  opacity: 0.8;
  color: var(--fuel-color-error);
  ${defaultButtonBottomMargin}
  `;

const butonBase = css`
  width: 100%;
  height: 40px;
  display: flex;
  border-radius: 11px;
  box-sizing: border-box;
  text-decoration: none;
  cursor: pointer;
  justify-content: center;
  align-items: center;
  margin: 0.4rem 0;
  font-size: var(--fuel-font-size);
  ${defaultButtonBottomMargin}

  &:disabled {
    cursor: not-allowed;
  }
`;

export const Button = styled.input`
  ${butonBase}
  background-color: var(--fuel-green-11);
  color: var(--fuel-black-color);


  &:disabled {
    background-color: var(--fuel-border-color);
    cursor: not-allowed;
  }

  &:hover {
    background-color: var(--fuel-green-11);
  }

  &:disabled {
    cursor: not-allowed;
  }
`;
export const ButtonDisconnect = styled.input`
  ${butonBase}
  color: var(--fuel-color-bold);
  background-color: transparent;
  border-color: var(--fuel-color-error);
  color: var(--fuel-color-error);
  border-width: 1px;

  &:hover {
    border-color: var(--fuel-button-background-hover);
    color: var(--fuel-button-background-hover); 
  }
`;

export const OrLabel = styled.div`
  font-weight: 400;
  text-align: center;
  line-height: 1;
  color: var(--fuel-color-light-gray);
`;

export const ButtonLoading = styled.div`
  ${butonBase}
  margin-bottom: 0;
`;
