import { AdapterInterface, ConnectionInterface } from '~/databaser/interfaces.ts';
import { ClientOptionType, CommonOptionType } from '~/databaser/types.ts';
import { Client, ClientOptions, Pool } from '@deno/postgres';
import { PostgresConnection } from '~/databaser/adapters/postgres/postgres.connection.ts';


export class PostgresAdapter implements AdapterInterface {
  public manager: Client | Pool;

  constructor(
    public common: CommonOptionType,
    public options: ClientOptionType,
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
    return new PostgresConnection(
      this.manager instanceof Pool ? await this.manager.connect() : this.manager,
    );
  }
}
