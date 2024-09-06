import { Avatar } from '@fuels/ui';
import styled from 'styled-components';

export interface IAvatarProps {
  background: string;
}
export const AvatarGenerated = styled<typeof Avatar, IAvatarProps>(Avatar)`
  background: ${(props) => props.background};
`;
