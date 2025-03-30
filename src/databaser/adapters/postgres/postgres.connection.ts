import { Client, PoolClient } from '@deno/postgres';
import { ConnectionInterface, TransactionInterface } from '~/databaser/interfaces.ts';
import { PostgresTransaction } from '~/databaser/adapters/postgres/postgres.transaction.ts';
import { TransactionOptionType } from '~/databaser/types.ts';

export class PostgresConnection implements ConnectionInterface {
  
  constructor(public client: Client | PoolClient) {}

  get connected(): boolean {
    return this.client.connected
  }
  
  async connect(): Promise<void> {
    return this.client.connect()
  }

  async disconnect(): Promise<void> {
    return this.client.end()
  }

  transaction(name: string, options: TransactionOptionType): TransactionInterface {
    return new PostgresTransaction(this.client, { name, transaction: options })
  }

  async execute<T>(query: string, args?: Array<string | number>): Promise<Array<T>> {
    return (await this.client.queryObject<T>(query, args)).rows
  }
 
}