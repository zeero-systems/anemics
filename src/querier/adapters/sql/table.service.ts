import { QuerierInterface, TableInterface, RawInterface } from '~/querier/interfaces.ts';
import { BracketFunction, QueryOptionType, QueryType, TableType, TableKeyType, SubQueryType } from '~/querier/types.ts';
import isBracket from '~/querier/guards/is-bracket.guard.ts';
import Sql from '~/querier/services/sql.service.ts';
import isQuerier from '~/querier/guards/is-querier.guard.ts';
import isRawwer from '~/querier/guards/is-raw.guard.ts';
import assign from '~/querier/functions/assign.function.ts';

export class Table implements TableInterface {
  
  protected tables: Array<TableType> = []
  
  constructor(
    protected query: QuerierInterface,
    protected tableKey?: TableKeyType
  ) { }

  hasTables(): boolean {
    return this.tables.length > 0
  }

  table(raw: RawInterface): this & QuerierInterface;
  table(alias: string, bracket: BracketFunction<SubQueryType>): this & QuerierInterface;
  table(name: string, alias?: string): this & QuerierInterface;
  table(name: any, alias?: any): this & QuerierInterface {
    const table: TableType = { name,  alias } as any

    if (isBracket(alias)) {
      const toAlias = table.name as string
      table.name = alias(new Sql())
      table.alias = toAlias
    }

    this.tables.push(table);

    return assign(this, this.query)
  }

  toTableQuery(options: QueryOptionType): QueryType {

    let text = ''
    
    if (this.hasTables()) {
      text = [
        this.tableKey,
        this.tables.map((table) => {
          let text = ''
  
          if (isQuerier(table.name)) {
            text = [
              `(${table.name?.toQuery(options).text})`,
              `AS ${table.alias}`
            ].filter(s => !!s).join(' ')
          }
  
          if (isRawwer(table.name)) { 
            text = table.name.toRawQuery(options).text
          }
  
          if (typeof table.name == 'string') {
            text = [
              table.name,
              table.alias ? `AS ${table.alias}` : undefined
            ].filter(s => !!s).join(' ')
          }
  
          return text
        }).join(', '),
      ].filter((s) => !!s).join(' ');
    }

    return { text, ...options }
  }
  
}

export default Table