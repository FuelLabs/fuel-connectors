import { Heading, Table, Text, Tooltip, VStack } from '@fuels/ui';
import type { CoinQuantity } from 'fuels';
import { StyledColumnHeaderCell, StyledText } from './styles';

export interface IAssetsProps {
  assets: CoinQuantity[];
}

export const Assets = ({ assets }: IAssetsProps) => {
  return (
    <VStack gap="3">
      <Text size="3" weight="medium">
        Assets
      </Text>
      <Table className="w-full" variant="ghost" size="1">
        <Table.Header>
          <Table.Row>
            <StyledColumnHeaderCell topLeft>
              <Text size="1" weight="medium" className="pl-3">
                Token
              </Text>
            </StyledColumnHeaderCell>
            <StyledColumnHeaderCell topRight>
              <Text size="1" weight="medium">
                Price
              </Text>
            </StyledColumnHeaderCell>
          </Table.Row>
        </Table.Header>

        <Table.Body>
          {assets.map((asset) => {
            return (
              <Table.Row key={asset.assetId}>
                <Table.RowHeaderCell>
                  <Tooltip content={asset.assetId}>
                    <StyledText size="1" className="pl-3">
                      {asset.assetId}
                    </StyledText>
                  </Tooltip>
                </Table.RowHeaderCell>
                <Table.Cell>
                  <Tooltip content={asset.amount.format()}>
                    <StyledText size="1">{asset.amount.format()}</StyledText>
                  </Tooltip>
                </Table.Cell>
              </Table.Row>
            );
          })}
        </Table.Body>
      </Table>
    </VStack>
  );
};
