import styled from 'styled-components';

export interface IFlexProps {
  direction?: 'column' | 'row';
  alignItems?: 'center' | 'flex-start' | 'flex-end';
  justifyContent?: 'center' | 'space-between' | 'space-around' | 'space-evenly';
  padding?: string;
  margin?: string;
  gap?: number;
  width?: string;
}
export const Flex = styled.div<IFlexProps>`
  display: flex;
  flex-direction: ${(props) => props.direction ?? 'column'};
  align-items: ${(props) => props.alignItems ?? 'center'};
  justify-content: ${(props) => props.justifyContent};
  gap: ${(props) => props.gap ?? 0}px;
  padding: ${(props) => props.padding ?? '0'};
  margin: ${(props) => props.margin ?? '0'};
  width: ${(props) => props.width ?? 'auto'};
`;

export interface IGridProps {
  columns?: string;
  rows?: string;
  alignItems?: 'center' | 'flex-start' | 'flex-end';
}
export const Grid = styled.div<IGridProps>`
  display: grid;
  grid-template-columns: ${(props) => props.columns ?? 'auto'};
  grid-template-rows: ${(props) => props.rows ?? 'auto'};
  align-items: ${(props) => props.alignItems ?? 'center'};
  width: 100%;
`;
