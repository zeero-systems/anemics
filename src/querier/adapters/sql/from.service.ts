import { QuerierInterface, TableInterface, RawInterface, FromInterface } from '~/querier/interfaces.ts';
import { BracketFunction, QueryOptionType, QueryType, SubQueryType } from '~/querier/types.ts';
import Table from '~/querier/adapters/sql/table.service.ts';

export class From implements FromInterface {
  
  protected from: TableInterface;

  constructor(
    protected query: QuerierInterface
  ) {
    this.from = new Table(query, 'FROM')
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

  toFromQuery(options: QueryOptionType): QueryType {
    return this.toTableQuery(options)
  }   
}

export default From