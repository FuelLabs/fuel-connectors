import { Table, type TableColumnHeaderCell, Text } from '@fuels/ui';
import styled from 'styled-components';

export interface StyledColumnHeaderCellProps {
  topLeft?: boolean;
  topRight?: boolean;
}
export const StyledColumnHeaderCell = styled<
  typeof TableColumnHeaderCell,
  StyledColumnHeaderCellProps
>(Table.ColumnHeaderCell)`
  background-color: var(--gray-3);
  border-radius: ${(props) => {
    const t = props.topLeft ? 0.75 : 0;
    const r = props.topRight ? 0.75 : 0;
    return `${t}rem ${r}rem 0 0`;
  }};
`;

export const StyledText = styled(Text)`
  display: block;
  overflow-x: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  width: 120px;
`;
