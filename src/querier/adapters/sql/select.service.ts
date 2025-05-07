import type { QuerierInterface, RawInterface, SelectInterface } from '~/querier/interfaces.ts';
import type { BracketFunction, QueryOptionType, QueryType, SelectType, SubQueryType } from '~/querier/types.ts';

import Sql from '~/querier/services/sql.service.ts';

import isBracket from '~/querier/guards/is-bracket.guard.ts';
import isQuerier from '~/querier/guards/is-querier.guard.ts';
import isRawwer from '~/querier/guards/is-raw.guard.ts';
import assign from '~/querier/functions/assign.function.ts';

export class Select implements SelectInterface {
  protected selects: Array<SelectType> = []
  
  constructor(
    protected query: QuerierInterface,
    protected selectKey: string = 'SELECT'
  ) { }

  hasSelects(): boolean {
    return this.selects.length > 0
  }

  column(raw: RawInterface): this & QuerierInterface;
  column(alias: string, bracket: BracketFunction<SubQueryType>): this & QuerierInterface;
  column(name: string, alias?: string): this & QuerierInterface;
  column(name: any, alias?: any): this & QuerierInterface {

    if (isBracket(alias)) {
      this.selects.push({ name, alias: alias(new Sql()) });
    } 
    
    if (alias) {
      this.selects.push({ name, alias });
    } else {
      this.selects.push({ name }); 
    }
    
    return assign(this.query.useClause(this), this.query)
  }
  
  toSelectQuery(options: QueryOptionType): QueryType {

    let text = ''
    
    if (this.hasSelects()) {
      text = [
        this.selectKey,
        this.selects.map((column) => {
  
          if (isQuerier(column.alias)) {
            return `(${column.alias.toQuery(options).text}) AS ${column.name}`
          } 
          
          if (isRawwer(column.name)) {
            return column.name.toRawQuery(options).text
          }
  
          return [
            column.name,
            column.alias ? ` AS ${column.alias}` : undefined,
          ].join('')
          
        }).join(', '),
      ].filter((s) => !!s).join(' ');
    }

    return { text, ...options };
  }
}

export default Select;
