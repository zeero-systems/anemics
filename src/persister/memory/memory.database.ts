import type { ClientOptionsType, CommonOptionsType } from '~/persister/types.ts';
import type { ConnectionInterface, DatabaseInterface } from '~/persister/interfaces.ts';

import { Connection } from '~/persister/memory/adapters/connection.adapter.ts';

export class Memory implements DatabaseInterface {
  constructor(
    public common: CommonOptionsType,
    public options: ClientOptionsType,
    public extra?: any,
  ) {}

  connection(): Promise<ConnectionInterface> {
    return Promise.resolve(new Connection({}));
  }
}

export default Memory;
