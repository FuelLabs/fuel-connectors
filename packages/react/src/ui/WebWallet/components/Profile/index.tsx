import { CopyIcon } from '../CopyIcon';
import { Avatar, Container, Typography } from './styles';

export interface IProfileProps {
  name: string;
}

export const Profile = ({ name }: IProfileProps) => {
  const nameParts = name.split(' ');
  const firstNameInitial = nameParts[0] ? nameParts[0][0] : '';
  const lastNameInitial = nameParts[1] ? nameParts[1][0] : '';

  return (
    <Container direction="row" gap={10}>
      <Avatar>
        {firstNameInitial}
        {lastNameInitial}
      </Avatar>
      <Container direction="column" alignItems="flex-start">
        <Typography fontWeight={600}>{name}</Typography>
        <Container direction="row" gap={5}>
          <Typography fontSize={8} color="#AEAEAE" fontWeight={600}>
            0x...adb
          </Typography>
          <CopyIcon width="10" height="10" />
        </Container>
      </Container>
    </Container>
  );
};
