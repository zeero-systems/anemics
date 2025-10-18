import type { QueryFunction, QueryType, ValueColumnType } from '~/querier/types.ts';
import type { BuilderInterface, InsertClauseInterface, TableClauseInterface } from '~/querier/interfaces.ts';

import { Objector, Descriptor } from '@zeero/commons';

import Table from '~/querier/postgresql/clauses/table.clause.ts';

@Descriptor({ properties: { enumerable: false } })
export class Insert<T extends BuilderInterface<T>> implements InsertClauseInterface<T> {
  public columns: Array<ValueColumnType> = [];
  public tabler: TableClauseInterface<T>;

  constructor(
    private _querier: T,
    private key: string = '',
  ) {
    this.tabler = new Table(this._querier);
  }

  public hasTables(): boolean {
    return this.tabler.hasTables();
  }

  public table(alias: string, query: QueryFunction<T>): this & T;
  public table(name: string, alias?: string): this & T;
  public table(name: any, alias?: any): this & T {
    this.tabler.table(name, alias);
    return Objector.assign(this._querier, this);
  }

  public column(name: string, value?: string | number | boolean): this & T {
    this.columns.push({ name, value: typeof value !== 'undefined' ? value : 'DEFAULT' });
    return Objector.assign(this._querier, this);
  }

  public query(options: QueryType): QueryType {
    const text: Array<string> = [];

    if (this.hasTables()) {
      text.push(this.key);
      text.push(this.tabler.query(options).text);
      text.push(
        `(${
          this.columns.map((column) => {
            return column.name;
          }).join(', ')
        })`,
      );
      text.push('VALUES');
      text.push(
        `(${
          this.columns.map((column) => {
            let text = `DEFAULT`;
            
            if (column.value !== 'DEFAULT') {
              text = `'${column.value}'`;
              options.args.push(column.value as any);
            }

            if (options.placeholder) {
              if (options.placeholderType == 'counter') {
                text = `${options.placeholder}${options.args.length}`;
              } else {
                text = `${options.placeholder}`;
              }
            }

            return text;
          }).join(', ')
        })`,
      );
    }

    return {
      ...options,
      args: options.args,
      text: text.filter((s) => !!s).join(' '),
    };
  }
}

export default Insert;
