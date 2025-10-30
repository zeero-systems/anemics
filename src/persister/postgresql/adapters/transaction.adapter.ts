import type { ExecuteOptionsType, ExecuteResultType, TransactionOptionType } from '~/persister/types.ts';
import type { TransactionInterface } from '~/persister/interfaces.ts';

import { Client, PoolClient, Transaction as PostgresTransaction } from '@deno/postgres';

export class Transaction implements TransactionInterface {
  transaction: PostgresTransaction 

  constructor(
    public client: Client | PoolClient, 
    public options: { 
      name: string, 
      transaction: TransactionOptionType
    }
  ) {
    this.transaction = client.createTransaction(options.name, options.transaction)
  }
  
  begin(): Promise<void> {
    return this.transaction.begin()
  }

  commit(): Promise<void> {
    return this.transaction.commit()
  }

  release(): Promise<void> {
    if (this.client instanceof Client) {
      return Promise.resolve();
    }
    return Promise.resolve(this.client.release())
  }

  execute<T>(query: string, options: ExecuteOptionsType = {}): Promise<ExecuteResultType<T>> {
    return this.transaction.queryObject<T>({ text: query, ...options })
      .then((result) => ({
        command: result.command,
        columns: result.columns,
        count: result.rowCount,
        rows: result.rows,
        notices: result.warnings
      }))
  }

  rollback(): Promise<void> {
    return this.transaction.rollback()
  }

  async [Symbol.asyncDispose]() {
    await this.release();
  }
 
}