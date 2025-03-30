import type { TransactionOptionType } from '~/databaser/types.ts';
import type { TransactionInterface } from '~/databaser/interfaces.ts';

import { Client, PoolClient, Transaction } from '@deno/postgres';

export class PostgresTransaction implements TransactionInterface {
  transaction: Transaction 

  constructor(
    public client: Client | PoolClient, 
    public options: { 
      name: string, 
      transaction: TransactionOptionType
    }
  ) {
    this.transaction = client.createTransaction(options.name, options.transaction)
  }
  
  async begin(): Promise<void> {
    return this.transaction.begin()
  }

  async commit(): Promise<void> {
    return this.transaction.commit()
  }

  async execute<T>(query: string, args?: Array<string | number>): Promise<T[]> {
    return (await this.transaction.queryObject<T>(query, args)).rows
  }

  async rollback(): Promise<void> {
    return this.transaction.rollback()
  }
 
}