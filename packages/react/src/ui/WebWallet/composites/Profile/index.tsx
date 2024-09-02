import { Avatar } from '../../components/Avatar';
import { Flex } from '../../components/Container';
import { CopyIcon } from '../../components/CopyIcon';
import { Typography } from '../../components/Typography';

export interface IProfileProps {
  name: string;
  address: string;
}

export const Profile = ({ name, address }: IProfileProps) => {
  const nameParts = name.split(' ');
  const firstNameInitial = nameParts[0] ? nameParts[0][0] : '';
  const lastNameInitial = nameParts[1] ? nameParts[1][0] : '';
  const copyAddress = () => {
    navigator.clipboard.writeText('0x...adb');
  };

  return (
    <Flex direction="row" gap={10}>
      <Avatar>
        {firstNameInitial}
        {lastNameInitial}
      </Avatar>
      <Flex direction="column" alignItems="flex-start">
        <Typography fontWeight={600}>{name}</Typography>
        <Flex direction="row" gap={5}>
          <Typography fontSize={8} color="#AEAEAE" fontWeight={600}>
            {address}
          </Typography>
          <CopyIcon width="10" height="10" onClick={copyAddress} />
        </Flex>
      </Flex>
    </Flex>
  );
};
