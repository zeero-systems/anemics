import type { ExecuteOptionsType, ExecuteResultType, TransactionOptionType } from '~/storer/types.ts';
import type { TransactionInterface } from '~/storer/interfaces.ts';

export class Transaction implements TransactionInterface {

  constructor(
    public client: any,
    public options: { 
      name: string, 
      transaction: TransactionOptionType
    }
  ) { }
  
  begin(): Promise<void> {
    return Promise.resolve()
  }

  commit(): Promise<void> {
    return Promise.resolve()
  }

  release(): Promise<void> {
    return Promise.resolve()
  }

  execute<T>(_query: string, _options: ExecuteOptionsType = {}): Promise<ExecuteResultType<T>> {
    return Promise.resolve({ command: 'NOOP', rows: [] })
  }

  rollback(): Promise<void> {
    return Promise.resolve()
  }
 
}