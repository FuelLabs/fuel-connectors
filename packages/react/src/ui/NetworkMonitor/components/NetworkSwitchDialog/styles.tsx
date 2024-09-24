import { css, styled } from 'styled-components';

const defaultVerticalMargin = '0.8em';

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
`;

export const Divider = styled.div`
  height: 1px;
  width: 100%;
  background-color: var(--fuel-separator-color);
  margin: 10px 0;
  box-sizing: border-box;
`;

export const Header = styled.div`
  margin: 0 51px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: ${defaultVerticalMargin};
  margin-bottom: ${defaultVerticalMargin};
`;

export const Description = styled.p`
  font-weight: 400;
  text-align: center;
  line-height: 1.2em;
  color: var(--fuel-color-light-gray);
`;

export const ErrorMessage = styled.div`
  font-weight: 400;
  text-align: center;
  line-height: 1.2em;
  opacity: 0.8;
  color: var(--fuel-color-error);
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
  margin-bottom: 0;

  &:disabled {
    cursor: not-allowed;
  }
`;

export const Button = styled.input`
  ${butonBase}
  background-color: var(--fuel-green-11);
  color: var(--fuel-black-color);
  margin-bottom: ${defaultVerticalMargin};

  &:disabled {
    background-color: var(--fuel-border-color);
    cursor: not-allowed;
  }
  &:disabled {
    cursor: not-allowed;
  }
`;

export const ButtonDisconnect = styled.input`
  ${butonBase}
  color: var(--fuel-color-bold);
  background-color: var(--fuel-button-background);
  margin-top: ${defaultVerticalMargin};
  &:hover {
    background-color: var(--fuel-button-background-hover);
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
