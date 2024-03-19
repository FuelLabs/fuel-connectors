const APP_BSAFE_URL = 'https://app.bsafe.pro/';

export class DAppWindow {
  BSAFEAPP = APP_BSAFE_URL;
  constructor(
    private config: {
      popup: {
        top: number;
        left: number;
        width: number;
        height: number;
      };
      sessionId: string;
      name: string;
      origin: string;
    },
  ) {}

  open(method: string) {
    const { popup } = this.config;

    return window.open(
      `${this.BSAFEAPP}${method}${this.queryString}`,
      'popup',
      `left=${popup.left},top=${popup.top},width=${popup.width},height=${popup.height}`,
    );
  }

  private get queryString() {
    const { origin, name, sessionId } = this.config;
    return `?sessionId=${sessionId}&name=${name}&origin=${origin}`;
  }
}
