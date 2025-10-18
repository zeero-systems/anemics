import type { ExecuteOptionsType, ExecuteResultType, TransactionOptionType } from '~/persister/types.ts';
import type { ConnectionInterface, TransactionInterface } from '~/persister/interfaces.ts';

import { Transaction } from '~/persister/memory/adapters/transaction.adapter.ts';

export class Connection implements ConnectionInterface {
  
  constructor(public client: any) {}

  get connected(): boolean {
    return true
  }
  
  connect(): Promise<void> {
    return Promise.resolve()
  }

  disconnect(): Promise<void> {
    return Promise.resolve()
  }

  transaction(name: string, options: TransactionOptionType): TransactionInterface {
    return new Transaction({}, { name, transaction: options })
  }

  execute<T>(_query: string, _options: ExecuteOptionsType = {}): Promise<ExecuteResultType<T>> {
    return Promise.resolve({ command: 'NOOP', rows: [] })
  }
 
}