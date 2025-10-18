import type { ClientOptionsType, CommonOptionsType } from '~/persister/types.ts';
import type { DatabaseInterface, ConnectionInterface } from '~/persister/interfaces.ts';

import { Client, ClientOptions, Pool } from '@deno/postgres';
import { Connection } from '~/persister/postgresql/adapters/connection.adapter.ts';

export class Postgresql implements DatabaseInterface {
  public manager: Client | Pool;

  constructor(
    public common: CommonOptionsType,
    public options: ClientOptionsType,
    public extra?: ClientOptions | string | undefined,
  ) {
    let normalized: ClientOptions | string | undefined = {
      applicationName: common.name
    };

    if (typeof extra == 'string' || typeof options == 'string') {
      normalized = extra || options;
    } else {
      normalized = { ...normalized, ...options, ...(extra || {}) };
    }

    if (common?.pool) {
      this.manager = new Pool(normalized, common.pool.max, common.pool.lazy);
    } else {
      this.manager = new Client(normalized);
    }
  }

  async connection(): Promise<ConnectionInterface> {
    return new Connection(
      this.manager instanceof Pool ? await this.manager.connect() : this.manager,
    );
  }
}

export default Postgresql
