import { css, styled } from 'styled-components';

export const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--fuel-items-gap);
  padding: 0px 14px;
  margin-top: 23px;
`;

export const Title = styled.h2`
  text-align: center;
  font-size: 1.2em;
  font-weight: 500;
  color: var(--fuel-color-bold);
  margin: 0 0 0.8em 0;
  padding: 0 1.8em;
`;

export const Description = styled.p<{ error?: boolean }>`
  font-weight: 400;
  text-align: center;
  margin: 0 1.2em;
  line-height: 1.2em;
  padding: 0 2em;
  opacity: 0.8;
  color: ${({ error }) =>
    error ? 'var(--fuel-color-error)' : 'var(--fuel-color-bold)'};
`;

export const DescriptionError = styled(Description)`
  color: var(--fuel-color-error);
`;

export const Content = styled.div`
  display: flex;
  flex-direction: column;
  margin-bottom: 1em;
`;

export const IconContainer = styled.div`
  display: flex;
  justify-content: center;
  height: 6.2em;
  width: 100%;
  margin-top: 1.6em;
  margin-bottom: 1.2em;
`;

const butonBase = css`
  width: 100%;
  background-color: var(--fuel-green-11);
  color: var(--fuel-black-color);
  display: flex;
  box-sizing: border-box;
  text-decoration: none;
  cursor: pointer;
  justify-content: center;
  align-items: center;
  margin: 0.4rem 1rem 0;
  padding: 0.6rem 0;
  font-size: var(--fuel-font-size);
  border-radius: var(--fuel-border-radius);
  `;

export const Button = styled.input`
  ${butonBase}


  &:visited {
    color: var(--fuel-black-color);
  }

  &:hover {
    background-color: var(--fuel-green-11);
  }
`;

export const ButtonLoading = styled.div`
  ${butonBase}
`;
