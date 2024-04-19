import { APP_NAME } from "./constants";

type PopupConfig = {
  appUrl: string;
  height: number;
  width: number;
  sessionId: string;
};

export class DAppWindow {
  constructor(private config: PopupConfig) {
  }

  private get popupConfig() {
    const { height, width} = this.config;
    return {
      top: window.innerHeight / 2 - height / 2,
      left: window.innerWidth / 2 - width / 2,
      width,
      height,
    };
  }

  open(method: string) {
    try{
      console.log('[opning]: ', `${this.config.appUrl}${method}${this.queryString}`)
      const { left, top, width, height } = this.popupConfig;
      const is = method.includes('/dapp/')

      if(is){
        return this.makeFrame(method)
      }
       
      // //return this.makeFrame(method);
      
      // this.makeLink(method)
      // return window.open()

      return this.makeLink(method)
    }catch(e){
      console.error('[ERROR]', e)
    }
  }


  makeFrame(method: string){
    console.log('[MAKE_FRAME]: ', method)
    const frame = document.createElement('iframe');
    frame.id = `${this.config.sessionId}-iframe`;
    frame.src = `${this.config.appUrl}${method}${this.queryString}`;
    // frame.src = 'https://google.com'//`${this.config.appUrl}${method}${this.queryString}`;
    console.log('[frame.src]: ', frame.src)
    //const $app = document.createElement('iframe');
    //console.log('[frame.src]: ', $app)
    frame.style.position = 'absolute';
    frame.style.zIndex = '99999999';
    frame.style.top = '15%';
    frame.style.left = '25%';
    frame.style.width = '50%';
    frame.style.height = '70%';
    frame.style.border = 'none';
    
    document.body.appendChild(frame);
  }

  close(){
    const frame = document.getElementById(`${this.config.sessionId}-iframe`);
    if(frame) document.body.removeChild(frame)
  }


  makeLink(method: string){
    const link = `${this.config.appUrl}${method}${this.queryString}`;

    const a = document.createElement("a");
    a.setAttribute('href', link);
    a.setAttribute('target', '_blank');
    a.click();
  }

  private get queryString() {
    const { sessionId } = this.config;
    return `?sessionId=${sessionId}&origin=${window.location.origin}&name=${APP_NAME}`;
  }
}
