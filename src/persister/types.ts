import type { TransactionOptionType } from '~/storer/types.ts';
import { EntryInterface, PredicateInterface } from '../querier/interfaces.ts';

export type RepositoryOptionsType = {
  encoder?: (arg: unknown) => null | string | Uint8Array;
  toTableNaming: (text?: string | number | symbol) => string
  toSchemaNaming: (text?: string | number | symbol) => string
}

export type ExecuteOptionsType = {
  connection?: 'client' | 'transaction'
  transaction?: TransactionOptionType
}

export type ActionOptionsType = ExecuteOptionsType & {
  returning?: Array<string>
}

export type JoinKeyType = 'inner' | 'left' | 'right' | 'full' | 'cross'

export type ManyOptionsType = {
  type?: JoinKeyType,
  on?: (predicate: PredicateInterface) => EntryInterface
}

export default {}
