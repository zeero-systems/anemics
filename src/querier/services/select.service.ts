import type { QuerierInterface, SelectInterface } from '~/querier/interfaces.ts';
import type { BracketFunction, FieldType, QueryArgType, QueryType, SelectStatementType } from '~/querier/types.ts';

import Querier from '~/querier/services/querier.services.ts';

import isBracket from '~/querier/guards/is-bracket.guard.ts';
import isQuerier from '~/querier/guards/is-querier.guard.ts';

export class Select implements SelectInterface {
  constructor(
    public query: QuerierInterface,
    public statement: SelectStatementType = { columns: [] },
  ) {}

  column(alias: string, bracket: BracketFunction<QuerierInterface>): this & QuerierInterface;
  column(name: string, alias?: string): this & QuerierInterface;
  column(name: unknown, alias: unknown): this & QuerierInterface {
    const field: FieldType = { name, alias } as any

    if (isBracket(alias)) {
      field.alias = alias(new Querier())
    }

    this.statement.columns.push(field);
    
    return Object.assign(this, this.query); 
  }
  
  columns(columns: Array<string | FieldType>): this & QuerierInterface {
    this.statement.columns.push(...columns.map((column) => {
      if (typeof column == 'string') {
        return { name: column }
      }

      return column
    }));
    return Object.assign(this, this.query);
  }

  distinct(): this & QuerierInterface {
    this.statement.distinct = true;
    return Object.assign(this, this.query);
  }

  toQuery(options: QueryArgType): QueryType {

    const text = [
      this.statement.distinct ? 'DISTINCT' : false,
      this.statement.columns.map((column) => {
        let text = ''

        if (isQuerier(column.alias)) {
          text = `(${column.alias.getQuery(options).text}) AS ${column.name}`
        } else {
          text = [
            column.name,
            column.alias ? ` AS ${column.alias}` : undefined,
          ].join('')
        }

        return text
      }).join(', '),
    ].filter((s) => !!s).join(' ');

    return { text, ...options };
  }
}

export default Select;
