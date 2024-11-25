import Capsule, { Environment } from '@usecapsule/react-sdk';

export const capsuleClient = new Capsule(
  Environment.BETA,
  import.meta.env.VITE_CAPSULE_CLIENT_ID,
);
