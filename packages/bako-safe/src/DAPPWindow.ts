import { WINDOW } from './constants';

type PopupConfig = {
  appUrl: string;
  height: number;
  width: number;
  sessionId: string;
  request_id: string;
};

export class DAppWindow {
  isMobile: boolean = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
  isSafariBrowser: boolean = /^((?!chrome|android).)*safari/i.test(
    navigator.userAgent,
  );
  request_id: string;
  isOpen = false;
  opned: Window | null = null;

  constructor(private config: PopupConfig) {
    this.request_id = config.request_id;
  }

  private get popupConfig() {
    const { height, width } = this.config;
    return {
      top: WINDOW.innerHeight / 2 - height / 2,
      left: WINDOW.innerWidth / 2 - width / 2,
      width,
      height:
        !this.isMobile && WINDOW.innerHeight >= height
          ? height
          : WINDOW.innerHeight,
    };
  }

  open(method: string, reject: (e: Error) => void) {
    if (this.isOpen) reject(new Error('Window is already open'));

    if (!this.isSafariBrowser) {
      // if is not safari, we can use popup for both cases
      this.makePopup(method);
    }
    // if (this.isSafariBrowser && isConnection) {
    //   // to use webauthn, we need a new WINDOW
    //   this.makeLink(method);
    // }
    if (this.isSafariBrowser) {
      // && !isConnection) {
      // to confirm tx, we need a new popup
      this.makePage(method);
    }

    return;
  }

  close() {
    const frame = document.getElementById(`${this.config.sessionId}-iframe`);
    const backdrop = document.getElementById(
      `${this.config.sessionId}-backdrop`,
    );
    if (frame) document.body.removeChild(frame);
    if (backdrop) document.body.removeChild(backdrop);
    if (this.opned) this.opned.close();
    this.isOpen = false;
  }

  makeLink(method: string) {
    const link = `${this.config.appUrl}${method}${this.queryString}`;
    const a = document.createElement('a');
    a.setAttribute('href', link);
    a.setAttribute('target', '_blank');
    a.click();
    this.isOpen = true;
  }

  makePage(method: string) {
    const link = `${this.config.appUrl}${method}${this.queryString}`;
    const popup = WINDOW.open(link, '_blank');
    if (popup) this.opned = popup;
    this.isOpen = true;
    return popup;
  }

  makePopup(method: string) {
    const link = `${this.config.appUrl}${method}${this.queryString}`;
    const popup = WINDOW.open(
      link,
      'popup',
      `width=${this.popupConfig.width}, height=${this.popupConfig.height}, top=${this.popupConfig.top}, left=${this.popupConfig.left}`,
    );
    if (popup) this.opned = popup;
    this.isOpen = true;
    return popup;
  }

  private get queryString() {
    const { sessionId } = this.config;
    return `?sessionId=${sessionId}&origin=${WINDOW.location.origin}&name=${WINDOW.document.title}&request_id=${this.request_id}`;
  }
}
