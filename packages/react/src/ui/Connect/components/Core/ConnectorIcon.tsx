import type { ConnectorMetadata } from 'fuels';

import type { SvgIconProps } from '../../../../types';
import { getImageUrl } from '../../utils/getImageUrl';

type ConnectorIconProps = {
  connectorName: string;
  connectorMetadata: ConnectorMetadata;
} & SvgIconProps;

export function ConnectorIcon({
  connectorName,
  connectorMetadata,
  ...props
}: ConnectorIconProps) {
  if (connectorMetadata.image) {
    return (
      <img
        height={`${props.size}px`}
        width={`${props.size}px`}
        src={getImageUrl(connectorMetadata, props.theme)}
        alt={`${connectorName} icon`}
      />
    );
  }

  return null;
}
