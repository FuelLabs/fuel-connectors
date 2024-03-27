import { urlJoin } from 'fuels';

export class RequestAPI {
  baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  async get(pathname: string) {
    const data = await fetch(urlJoin(this.baseUrl, pathname)).then((res) =>
      res.json(),
    );
    return data;
  }
}
