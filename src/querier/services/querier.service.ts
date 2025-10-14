import type { NewableType } from '@zeero/commons';
import type { BuilderOptionsType, QuerierOptionsType, QueryType } from '~/querier/types.ts';
import type { JoinClauseInterface, OrderClauseInterface, PredicateClauseInterface, QuerierInterface, QueryInterface, RawClauseInterface, SelectClauseInterface, TableClauseInterface } from '~/querier/interfaces.ts';

import PostgreSqlQuery from '~/querier/postgresql/adapters/postgresql.query.ts'

export class Querier implements QuerierInterface<QueryInterface> {
  ref!: NewableType<any>
  adapter: QueryInterface = {} as QueryInterface
  
  constructor(public options: QuerierOptionsType) {
    if (options.syntax == 'mySQL') {
      throw new Error("Adapter mySQL not implemented");
      
    }
    if (options.syntax == 'postgreSQL') {
      this.ref = PostgreSqlQuery
      this.adapter = new PostgreSqlQuery()
    }
  }

  get select(): SelectClauseInterface<QueryInterface> {
    return this.adapter.select
  }
  get from(): TableClauseInterface<QueryInterface> {
    return this.adapter.from
  }
  get where(): PredicateClauseInterface<QueryInterface> {
    return this.adapter.where
  }
  get left(): JoinClauseInterface<QueryInterface> {
    return this.adapter.left
  }
  get right(): JoinClauseInterface<QueryInterface> {
    return this.adapter.right
  }
  get inner(): JoinClauseInterface<QueryInterface> {
    return this.adapter.inner
  }
  get cross(): JoinClauseInterface<QueryInterface> {
    return this.adapter.cross
  }
  get full(): JoinClauseInterface<QueryInterface> {
    return this.adapter.full
  }
  get order(): OrderClauseInterface<QueryInterface> {
    return this.adapter.order
  }
  get raw(): RawClauseInterface<QueryInterface> {
    return this.adapter.raw
  }

  with(options: BuilderOptionsType): QueryInterface {
    return this.adapter.with(options)
  }

  instantiate(): QueryInterface {
    return this.adapter.instantiate()
  }

  toQuery(options: QueryType = { args: [], text: '' }): QueryType {
    const query = this.adapter.toQuery(options)
    this.adapter = new this.ref()
    return query
  }
}

export default Querier;
