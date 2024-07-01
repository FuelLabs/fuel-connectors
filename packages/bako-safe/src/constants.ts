export const APP_VERSION = '0.0.0';
export const APP_NETWORK = '0.0.0';
export const APP_NAME = 'Bako Safe';
export const APP_DESCRIPTION =
  'Bako Safe is a connector to safe.bako.global, a non-custodial vault for your crypto assets.';
export const APP_IMAGE_DARK =
  'https://safe.bako.global/BAKO_CONNECTOR_ICON.svg';
export const APP_IMAGE_LIGHT =
  'https://safe.bako.global/BAKO_CONNECTOR_ICON.svg';

export const APP_URL = 'https://safe.bako.global';
export const HOST_URL = 'https://api.bako.global';
export const SOCKET_URL = 'https://api.bako.global';

// Window object
export const HAS_WINDOW = typeof window !== 'undefined';
// biome-ignore lint/suspicious/noExplicitAny: <explanation>
export const WINDOW: any = HAS_WINDOW ? window : {};

//storage
export const SESSION_ID = 'sessionId';
