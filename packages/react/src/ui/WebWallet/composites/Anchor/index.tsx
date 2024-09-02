import { Button } from '../../components/Button';
import { Flex } from '../../components/Container';
import { Typography } from '../../components/Typography';
import { WalletIcon } from '../../components/WalletIcon';

export interface IAnchorProps {
  address: string;
  onClick: () => void;
}
export const Anchor = ({ address, onClick }: IAnchorProps) => {
  return (
    <Button
      color="white"
      backgroundColor="grey"
      float="right"
      padding="5px 10px"
      onClick={onClick}
    >
      <Flex direction="row" gap={5}>
        <WalletIcon width="12" height="12" color="white" />
        <Typography color="white">{address}</Typography>
      </Flex>
    </Button>
  );
};
