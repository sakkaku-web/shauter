import { Axios } from 'axios';
import { ShautMessage } from '@shauter/core';

export class ShautClient {
  private client: Axios;

  constructor(baseURL: string) {
    this.client = new Axios({
      baseURL,
    });
  }

  async shautMessage(msg: ShautMessage) {
    await this.client.post('/shaut', JSON.stringify(msg));
  }
}
