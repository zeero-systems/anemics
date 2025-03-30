import { FromInterface, QuerierInterface } from '~/querier/interfaces.ts';
import { BracketFunction, FromStatementType, QueryArgType, QueryType, TableType } from '~/querier/types.ts';
import isBracket from '~/querier/guards/is-bracket.guard.ts';
import Querier from '~/querier/services/querier.services.ts';
import isQuerier from '~/querier/guards/is-querier.guard.ts';

export class From implements FromInterface {
  constructor(
    public query: QuerierInterface,
    public statement: Array<FromStatementType> = []
  ) {}

  table(alias: string, bracket: BracketFunction<QuerierInterface>): this & QuerierInterface;
  table(name: string, alias?: string): this & QuerierInterface;
  table(name: unknown, alias?: unknown): this & QuerierInterface {
    const table: FromStatementType = { name,  alias } as any

    if (isBracket(alias)) {
      const toAlias = table.name as string
      table.name = alias(new Querier())
      table.alias = toAlias
    }

    this.statement.push(table);
    
    return Object.assign(this, this.query)
  }

  tables(tables: Array<string | TableType>): this & QuerierInterface {
    this.statement.push(...tables.map((table) => {
      if (typeof table == 'string') {
        return { name: table }
      }

      return table
    }));

    return Object.assign(this, this.query);
  }

  toQuery(options: QueryArgType): QueryType {

    const text = [
      this.statement.map((table) => {
        let text = ''

        if (isQuerier(table.name)) {
          text = [
            `(${table.name?.getQuery(options).text})`,
            `AS ${table.alias}`
          ].filter(s => !!s).join(' ')
        }

        if (typeof table.name == 'string') {
          text = [
            table.name,
            table.alias ? `AS ${table.alias}` : undefined
          ].filter(s => !!s).join(' ')
        }

        return text
      }).join(', '),
    ].filter((s) => !!s).join('');

    return { text, ...options }
  }
  
}

export default From