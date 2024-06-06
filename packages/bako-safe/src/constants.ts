export const APP_NAME = 'Bako Safe';
export const APP_DESCRIPTION =
  'Bako Safe is a connector to safe.bako.global, a non-custodial vault for your crypto assets.';
export const APP_IMAGE_DARK =
  'https://safe.bako.global/BAKO_CONNECTOR_ICON.svg';
export const APP_IMAGE_LIGHT =
  'https://safe.bako.global/BAKO_CONNECTOR_ICON.svg';

export const APP_URL = 'https://safe.bako.global';
export const HOST_URL = 'https://api-safe.bako.global';
export const SOCKET_URL = 'https://api-safe.bako.global';

// export const APP_URL = 'https://bsafe-ui-git-staging-infinity-base.vercel.app/';
// export const HOST_URL = 'https://stg-api.bsafe.pro';
// export const SOCKET_URL = 'https://stg-api.bsafe.pro';

// export const APP_URL = 'http://localhost:5174';
// export const HOST_URL = 'http://localhost:3333';
// export const SOCKET_URL = 'http://localhost:3001';

// Window object
export const HAS_WINDOW = typeof window !== 'undefined';
// biome-ignore lint/suspicious/noExplicitAny: <explanation>
export const WINDOW: any = HAS_WINDOW ? window : {};
