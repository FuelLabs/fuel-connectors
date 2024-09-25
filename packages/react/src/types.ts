export type Connector = {
  name: string;
  image:
    | string
    | {
        light: string;
        dark: string;
      };
  connector: string;
  install: {
    action: string;
    link: string;
    description: string;
  };
  installed: boolean;
};

export type SvgIconProps = {
  theme?: string;
  className?: string;
  onClick?: () => void;
  size: number;
};

export type ConnectorList = Array<Connector>;
