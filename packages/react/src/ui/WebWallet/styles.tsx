import { styled } from 'styled-components';

export const Container = styled.div`
  position: absolute;
  bottom: 0px;
  right: 0px;
  z-index: 90;
  min-width: 400px;
`;

export const Modal = styled.div`
  max-width: 400px;
  background-color: #fff;
  border-radius: 16px;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
  padding: 15px;
  margin: 50px 30px;
  display: flex;
  flex-direction: column;
`;

export const Header = styled.div`
  display: flex;
  justify-content: flex-start;
  gap: 15px;
  align-items: center;
  margin-bottom: 15px;
`;

export const DashedSeparator = styled.div`
  width: 100%;
  height: 1px;
  margin: 15px 0;
  border-bottom-width: thin;
  border-bottom-style: dashed;
  border-bottom-color: #000;
`;
