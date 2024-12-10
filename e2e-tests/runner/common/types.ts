import type { Page } from '@playwright/test';

export type ConnectFunction = (page: Page) => Promise<void>;
export type ApproveTransferFunction = (page: Page) => Promise<void>;

/**
 * Connector interface, where each wallet connector implements
 * its own connect and approveTransfer functions.
 */
export interface ConnectorFunctions {
  connect: ConnectFunction;
  secondConnect?: ConnectFunction;
  approveTransfer: ApproveTransferFunction;
  keepSession?: boolean;
}
