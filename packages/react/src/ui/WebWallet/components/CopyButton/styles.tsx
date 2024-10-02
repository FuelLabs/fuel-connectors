import { IconCopy, type TablerIconsProps } from '@tabler/icons-react';

const IconCopyStyle: React.CSSProperties = {
  cursor: 'pointer',
  color: 'var(--fuel-color-muted)',
};

export const StyledIconCopy = ({ ...props }: TablerIconsProps) => (
  <IconCopy style={IconCopyStyle} {...props} />
);
