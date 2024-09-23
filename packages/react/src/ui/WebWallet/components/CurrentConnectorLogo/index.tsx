import type { FuelConnector } from 'fuels';

export const CurrentConnectorLogo = ({
  currentConnector,
  width = 46,
  height = 46,
}: { currentConnector?: FuelConnector; width?: number; height?: number }) => {
  const logo =
    currentConnector && typeof currentConnector.metadata?.image === 'object'
      ? currentConnector.metadata.image.dark ?? ''
      : (currentConnector?.metadata?.image as string) ?? '';
  const _style = {
    width: `${width}px`,
    height: `${height}px`,
  };
  return (
    <img
      src={logo}
      alt={currentConnector?.name}
      // style={style}
      className="w-[57px] h-[57px]"
    />
  );
};
