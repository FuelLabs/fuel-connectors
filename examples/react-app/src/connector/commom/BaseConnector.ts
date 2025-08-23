export interface ConnectorConfig {
  name: string;
  version: string;
  enabled: boolean;
}

export abstract class BaseConnector {
  protected config: ConnectorConfig;
  protected connected = false;

  constructor(config: ConnectorConfig) {
    this.config = config;
  }

  abstract connect(): Promise<boolean>;
  abstract disconnect(): Promise<void>;
  abstract isConnected(): boolean;

  getName(): string {
    return this.config.name;
  }

  getVersion(): string {
    return this.config.version;
  }

  isEnabled(): boolean {
    return this.config.enabled;
  }

  getConfig(): ConnectorConfig {
    return { ...this.config };
  }
}
