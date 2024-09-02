import styled from 'styled-components';

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
