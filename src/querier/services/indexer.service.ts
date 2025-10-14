import type { BuilderOptionsType, IndexerOptionsType, QueryType } from '~/querier/types.ts';
import type { JoinClauseInterface, OrderClauseInterface, PredicateClauseInterface, IndexerInterface, IndexInterface, RawClauseInterface, SelectClauseInterface, TableClauseInterface } from '~/querier/interfaces.ts';

import PostgreSQLIndex from '~/querier/clauses//postgres/index.adapter.ts'
import { NewableType } from '@zeero/commons';

export class Indexer implements IndexerInterface<IndexInterface> {
  ref!: NewableType<any>
  adapter: IndexInterface = {} as IndexInterface
  
  constructor(public options: IndexerOptionsType) {
    if (options.syntax == 'mySQL') {
      throw new Error("Adapter mySQL not implemented");
      
    }
    if (options.syntax == 'postgreSQL') {
      this.ref = PostgreSQLIndex
      this.adapter = new PostgreSQLIndex()
    }
  }

  get create(): NameClauseInterface<IndexInterface> {
    return this.adapter.name
  }
  get on(): TableClauseInterface<IndexInterface> {
    return this.adapter.on
  }
  get using(): IndexTypeClauseInterface<IndexInterface> {
    return this.adapter.using
  }
  get with(): SelectClauseInterface<IndexInterface> {
    return this.adapter.with
  }
  get raw(): RawClauseInterface<IndexInterface> {
    return this.adapter.raw
  }

  with(options: BuilderOptionsType): IndexInterface {
    return this.adapter.with(options)
  }

  instantiate(): IndexInterface {
    return this.adapter.instantiate()
  }

  toQuery(options: QueryType = { args: [], text: '' }): QueryType {
    const query = this.adapter.toQuery(options)
    this.adapter = new this.ref()
    return query
  }
}

export default Indexer;
