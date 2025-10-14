import type { NewableType } from '@zeero/commons';
import type { QuerierOptionsType, FilterType, FilterPredicateType } from '~/querier/types.ts';
import type { EntryInterface, QuerierInterface } from '~/querier/interfaces.ts';
import type { DatabaseInterface } from '~/storer/interfaces.ts';
import type { ActionOptionsType, ExecuteOptionsType, RepositoryOptionsType } from '~/persister/types.ts';
import type { ExecuteResultType } from '~/storer/types.ts';

import SchemaAnnotation from '~/storer/annotations/schema.annotation.ts';

export interface RepositoryInterface<T extends NewableType<T>> {
  types: string[]

  record: RecordInterface<T>
  table: TableInterface<T>

  schema: T
  querier: QuerierInterface
  database: DatabaseInterface
  options: RepositoryOptionsType
  annotation: SchemaAnnotation
  
  execute(queries: QuerierOptionsType[], options?: ExecuteOptionsType): Promise<Array<ExecuteResultType<InstanceType<T>>>>
  executeWithConnect(queriers: QuerierOptionsType[], options?: ExecuteOptionsType): Promise<ExecuteResultType<InstanceType<T>>[]>
  executeWithTransaction(queriers: QuerierOptionsType[], options?: ExecuteOptionsType): Promise<ExecuteResultType<InstanceType<T>>[]>
}

export interface TableInterface<T extends NewableType<T>> {
  create(): Promise<InstanceType<T>>
  createQuery(): Array<QuerierOptionsType>
  createExecute(): Promise<Array<ExecuteResultType<InstanceType<T>>>>

  drop(action?: 'cascade' | 'restrict'): Promise<boolean>
  dropQuery(action?: 'cascade' | 'restrict'): Array<QuerierOptionsType>
  dropExecute(action?: 'cascade' | 'restrict'): Promise<Array<ExecuteResultType<InstanceType<T>>>>
}

export interface RecordInterface<T extends NewableType<T>> {
  create(record: InstanceType<T> , options?: ActionOptionsType): Promise<InstanceType<T>>
  createMany(records: Array<InstanceType<T>>, options?: ActionOptionsType): Promise<Array<InstanceType<T>>>
  createQuery(records: Array<InstanceType<T>>, options?: ActionOptionsType): Array<QuerierOptionsType>
  createExecute(records: Array<InstanceType<T>>, options?: ActionOptionsType): Promise<Array<ExecuteResultType<InstanceType<T>>>>

  update(record: Partial<InstanceType<T>>, options?: ActionOptionsType): Promise<InstanceType<T>>
  updateMany(records: Array<Partial<InstanceType<T>>>, options?: ActionOptionsType): Promise<Array<Partial<InstanceType<T>>>>
  updateQuery(records: Array<Partial<InstanceType<T>>>, options?: ActionOptionsType): Array<QuerierOptionsType>
  updateExecute(records: Array<Partial<InstanceType<T>>>, options?: ActionOptionsType): Promise<Array<ExecuteResultType<InstanceType<T>>>>

  delete(query: FilterPredicateType | InstanceType<T>, returning?: ActionOptionsType): Promise<InstanceType<T>>
  deleteMany(queries: Array<FilterPredicateType | InstanceType<T>>, returning?: ActionOptionsType): Promise<Array<InstanceType<T>>>
  deleteQuery(where: FilterPredicateType, returning?: ActionOptionsType): QuerierOptionsType
  deleteExecute(where: FilterPredicateType, returning?: ActionOptionsType): Promise<Array<ExecuteResultType<InstanceType<T>>>>
  
  search(search: FilterType): Promise<Array<InstanceType<T>>>
  searchFirst(search: FilterType): Promise<InstanceType<T>>
  searchQuery(search: FilterType, options?: ActionOptionsType & { entry: EntryInterface }): QuerierOptionsType
  searchExecute(search: FilterType, options?: ActionOptionsType & { entry: EntryInterface }): Promise<Array<ExecuteResultType<InstanceType<T>>>>
}


export default {}