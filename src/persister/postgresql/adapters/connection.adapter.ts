import type { TransactionOptionType, ExecuteOptionsType, ExecuteResultType } from '~/persister/types.ts';
import type { ConnectionInterface, TransactionInterface } from '~/persister/interfaces.ts';

import { Client, PoolClient } from '@deno/postgres';
import { Transaction } from '~/persister/postgresql/adapters/transaction.adapter.ts';

export class Connection implements ConnectionInterface {
  
  constructor(public client: Client | PoolClient) {}

  get connected(): boolean {
    return this.client.connected
  }
  
  connect(): Promise<void> {
    return this.client.connect()
  }

  disconnect(): Promise<void> {
    return this.client.end()
  }

  transaction(name: string, options?: TransactionOptionType): TransactionInterface {
    return new Transaction(this.client, { name, transaction: options || {} })
  }

  async execute<T>(query: string, options: ExecuteOptionsType = {}): Promise<ExecuteResultType<T>> {
    return await this.client.queryObject<T>({ text: query, ...options })
      .then((result) => ({
        command: result.command,
        columns: result.columns,
        count: result.rowCount,
        rows: result.rows,
        notices: result.warnings
      }))
  }

  async [Symbol.asyncDispose]() {
    await this.disconnect();
  }
 
}