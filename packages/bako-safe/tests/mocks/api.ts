import {
  ACCOUNTS,
  CURRENT_ACCOUNT,
  CURRENT_NETWORK,
  STATE,
} from './constantes';

export class MockedRequestAPI {
  baseUrl: string;

  constructor(baseUrl = 'http://fakeurl') {
    this.baseUrl = baseUrl;
  }

  async get(pathname: string) {
    const last = pathname.lastIndexOf('/');
    const _pathname = pathname.substring(last + 1, pathname.length);

    switch (_pathname) {
      case 'currentNetwork':
        return CURRENT_NETWORK;
      case 'state':
        return STATE;
      case 'currentAccount':
        return CURRENT_ACCOUNT;
      case 'accounts':
        return ACCOUNTS;
    }
  }

  async delete(_pathname: string) {
    return;
  }
}
