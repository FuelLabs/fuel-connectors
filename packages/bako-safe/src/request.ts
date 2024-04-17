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

  async post(pathname: string, body: any) {
    const data = await fetch(urlJoin(this.baseUrl, pathname), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body,
    }).then((res) => res.json());
    return data;
  }


  async delete(pathname: string) {
    await fetch(urlJoin(this.baseUrl, pathname), {
      method: 'DELETE',
    });
  }
}

