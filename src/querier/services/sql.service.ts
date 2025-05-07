import {
  JoinInterface,
  OrderInterface,
  QuerierInterface,
  SelectInterface,
  ClauseInterface,
  FromInterface,
  RawwerInterface,
  WhereInterface
} from '~/querier/interfaces.ts';
import { Text } from '@zxxxro/commons';
import { QuerierOptionType, QueryOptionType, QueryType } from '~/querier/types.ts';
import Select from '~/querier/adapters/sql/select.service.ts';
import Order from '~/querier/adapters/sql/order.service.ts';
import Join from '~/querier/adapters/sql/join.service.ts';
import isFrom from '~/querier/guards/is-from.guard.ts';
import isSelect from '~/querier/guards/is-select.guard.ts';
import isWhere from '~/querier/guards/is-where.guard.ts';
import isRaw from '~/querier/guards/is-raw.guard.ts';
import isJoin from '~/querier/guards/is-join.guard.ts';
import isOrder from '~/querier/guards/is-order.guard.ts';
import From from '~/querier/adapters/sql/from.service.ts';
import Rawwer from '~/querier/adapters/sql/rawwer.service.ts';
import Where from '~/querier/adapters/sql/where.service.ts';

export class Sql implements QuerierInterface {

  public syntax: 'SQL' = 'SQL';

  public from: FromInterface = new From(this)
  public select: SelectInterface = new Select(this)
  public where: WhereInterface = new Where(this)
  public inner: JoinInterface = new Join(this, 'INNER')
  public left: JoinInterface = new Join(this, 'LEFT')
  public order: OrderInterface = new Order(this)
  public raw: RawwerInterface = new Rawwer(this)

  public clauses: Array<ClauseInterface> = []

  constructor(public options?: QuerierOptionType) { }

  useClause = (clause: ClauseInterface) => {
    if (
      this.clauses.length == 0 ||
      this.clauses[this.clauses.length-1] != clause
    ) {
      this.clauses.push(clause)
    }
    return clause
  }

  toQuery = (options: QueryOptionType = { args: [], counter: 0, placeholderType: 'counter' }): QueryType => {
    
    options = { ...options, ...this.options }
    
    return {
      text: this.clauses.map((clause: ClauseInterface) => {
        let key = 'undefined'
        
        if (isFrom(clause)) key = 'From'
        if (isSelect(clause)) key = Text.toFirstLetterUppercase(String(clause['selectKey']).toLowerCase())
        if (isWhere(clause)) key = 'Where'
        if (isRaw(clause)) key = 'Raw'
        if (isJoin(clause)) key = 'Join'
        if (isOrder(clause)) key = Text.toFirstLetterUppercase(String(clause['orderKey']).toLowerCase())

        return clause[`to${key}Query`](options).text as string
      }).filter(s => !!s).join(' '),
      ...options
    }
  };
}

export default Sql

// @todo

// anemics
// refactor to be able to use only specifics parts of the systems

// anemics: querier
// test performance usign object.assign. Change class methods to properties to use spreding
// x add parameters to the currente implementation with counter of placeholders, even the recursive ones
// x put everything in files
// add tests for a more use cases
// - implement a lot more of the sql syntax
// x add raw to everything added until now
// x add skipBinding to everything added until now (per instance configuration, default: no binding)
// add a cache mechanism to save the reusable generated query type [text, args]

// anemics: databaser
// implement a mongodb driver
// implement a query builder for mongo

// commons
// refactor to be able to use only specifics parts of the systems
// implement a lot of more validators
