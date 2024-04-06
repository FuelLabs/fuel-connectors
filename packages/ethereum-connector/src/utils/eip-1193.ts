import type EventEmitter from 'node:events';

export interface EIP1193Provider extends EventEmitter {
  // biome-ignore lint/suspicious/noExplicitAny:
  request(args: { method: string; params?: any[] }): Promise<any>;
  providers?: EIP1193Provider[];
}
