import styled from 'styled-components';

export const Avatar = styled.span`
  display: flex;
  justify-content: center;
  align-items: center;
  width: 30px;
  height: 30px;
  background-color: brown;
  color: #ffffff;
  font-size: 12px;
  border-radius: 50%;
`;

export interface IContainerProps {
  direction?: 'column' | 'row';
  alignItems?: 'center' | 'flex-start' | 'flex-end';
  gap?: number;
}
export const Container = styled.div<IContainerProps>`
  display: flex;
  flex-direction: ${(props) => props.direction ?? 'column'};
  align-items: ${(props) => props.alignItems ?? 'center'};
  gap: ${(props) => props.gap ?? 0}px;
`;

export interface ITypographyProps {
  color?: string;
  fontSize?: number;
  fontWeight?: number;
}
export const Typography = styled.p<ITypographyProps>`
  font-size: ${(props) => props.fontSize ?? 12}px;
  color: ${(props) => props.color ?? '#000000'};
  font-weight: ${(props) => props.fontWeight ?? 400};
`;
