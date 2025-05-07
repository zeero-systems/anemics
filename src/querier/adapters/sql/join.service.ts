import { JoinInterface, QuerierInterface, RawInterface, PredicateInterface, TableInterface } from '~/querier/interfaces.ts';
import { BracketFunction, JoinKeyType, QueryOptionType, QueryType, SubQueryType } from '~/querier/types.ts';
import Predicate from '~/querier/adapters/sql/predicate.service.ts';
import Table from '~/querier/adapters/sql/table.service.ts';
import assign from '~/querier/functions/assign.function.ts';

export class Join implements JoinInterface {
  
  public on: PredicateInterface;
  public using: PredicateInterface;
  public where: PredicateInterface;

  protected from: TableInterface;
  
  constructor(
    public query: QuerierInterface,
    protected joinKey: JoinKeyType = 'INNER'
  ) {
    this.from = new Table(assign(this, query))
    this.on = new Predicate(query, 'ON')
    this.using = new Predicate(query, 'USING')
    this.where = new Predicate(query, 'WHERE')
  }
  
  hasTables(): boolean {
    return this.from.hasTables()
  }

  table(raw: RawInterface): this & QuerierInterface;
  table(alias: string, bracket: BracketFunction<SubQueryType>): this & QuerierInterface;
  table(name: string, alias?: string): this & QuerierInterface;
  table(name: any, alias?: any): this & QuerierInterface {
    this.query.useClause(this)
    return this.from.table(name, alias) as any
  }

  toTableQuery(options: QueryOptionType): QueryType {
    return this.from.toTableQuery(options)
  }

  toJoinQuery(options: QueryOptionType): QueryType {
    return {
      text: [
        this.joinKey,
        'JOIN',
        this.toTableQuery(options).text,
        this.on.toPredicateQuery(options).text,
        this.using.toPredicateQuery(options).text,
        this.where.toPredicateQuery(options).text,
      ].filter(s => !!s).join(' '),
      ...options
    }
  }
}

export default Join
