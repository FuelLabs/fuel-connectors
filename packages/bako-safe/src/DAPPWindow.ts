type PopupConfig = {
  appUrl: string;
  height: number;
  width: number;
  sessionId: string;
};

export class DAppWindow {
  constructor(private config: PopupConfig) {}

  private get popupConfig() {
    const { height, width } = this.config;
    return {
      top: window.innerHeight / 2 - height / 2,
      left: window.innerWidth / 2 - width / 2,
      width,
      height,
    };
  }

  open(method: string) {
    const { left, top, width, height } = this.popupConfig;
    return window.open(
      `${this.config.appUrl}${method}${this.queryString}`,
      'popup',
      `left=${left},top=${top},width=${width},height=${height}`,
    );
  }

  private get queryString() {
    const { sessionId } = this.config;
    return `?sessionId=${sessionId}&name=${document.title}&origin=${window.origin}`;
  }
}
