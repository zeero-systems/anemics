import type { ClientOptionsType, CommonOptionsType } from '~/storer/types.ts';
import type { DatabaseInterface, ConnectionInterface } from '~/storer/interfaces.ts';

import { Connection } from '~/storer/services/memory/connection.service.ts';

export class Memory implements DatabaseInterface {

  constructor(
    public common: CommonOptionsType,
    public options: ClientOptionsType,
    public extra?: any,
  ) { }

  connection(): Promise<ConnectionInterface> {
    return Promise.resolve(new Connection({}))
  }
}

export default Memory

