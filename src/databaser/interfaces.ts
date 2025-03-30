import { ClientOptionType, CommonOptionType, TransactionOptionType } from '~/databaser/types.ts';
import { AdapterEnum } from '~/databaser/enums/AdapterEnum.ts';
import { ConstructorType } from '@zxxxro/commons';

export interface NamingInterface {
  getTableName(name: string): string
  getColumnName(name: string): string
  getRelationName(name: string, relatedName: string): string
  getForeignKeyName(name: string): string
}

export interface AdapterInterface {
  extra?: any
  common: CommonOptionType
  options: ClientOptionType

  connection(): Promise<ConnectionInterface>
}

export interface TransactionInterface {
  client: any
  options: {
    name: string
    transaction: TransactionOptionType
  }

  begin(): Promise<void>
  commit(): Promise<void>
  execute<T>(query: string, args?: Array<string | number>): Promise<Array<T>>
  rollback(): Promise<void>
}

export interface ConnectionInterface {
  client: any
  connected?: boolean

  connect(): Promise<void>
  disconnect(): Promise<void>
  transaction(name: string, options?: TransactionOptionType): TransactionInterface
  execute<T>(query: string, args?: Array<string | number>): Promise<Array<T>>
}

export interface SourceInterface {
  adapter: AdapterInterface
  adapters: Map<AdapterEnum, ConstructorType<AdapterInterface>>
}

export default {}