import { Avatar } from '../../components/Avatar';
import { Flex, Grid } from '../../components/Container';
import { Typography } from '../../components/Typography';

export const AssetRow = ({
  token,
  price,
}: { token: string; price: string }) => {
  return (
    <Grid
      columns="0.4fr 1.6fr 1fr"
      style={{
        padding: '15px 15px',
        borderBottom: '1px solid grey',
      }}
    >
      <Avatar>
        <img
          src="https://cryptologos.cc/logos/ethereum-eth-logo.png"
          alt="ETH"
          style={{ width: 20, height: 20 }}
        />
      </Avatar>
      <Typography fontSize={14} fontWeight={400}>
        {token}
      </Typography>
      <Typography fontSize={14} fontWeight={400}>
        {price}
      </Typography>
    </Grid>
  );
};

export const Assets = () => {
  return (
    <Flex direction="column" alignItems="flex-start" gap={10}>
      <Typography fontSize={16} fontWeight={700}>
        Assets
      </Typography>
      <Flex direction="column" alignItems="flex-start" width="100%">
        <Grid
          columns="2fr 1fr"
          style={{
            padding: '0 15px',
            backgroundColor: 'grey',
            borderTopLeftRadius: 10,
            borderTopRightRadius: 10,
          }}
        >
          <Typography fontSize={14} fontWeight={400}>
            Token
          </Typography>
          <Typography fontSize={14} fontWeight={400}>
            Price
          </Typography>
        </Grid>
        {[
          { token: 'ETH', price: '$3000' },
          { token: 'ETH', price: '$3000' },
          { token: 'ETH', price: '$3000' },
        ].map(({ token, price }) => (
          <AssetRow key={`${token}_${price}`} token={token} price={price} />
        ))}
      </Flex>
    </Flex>
  );
};
