import type { AliasColumnType, QueryFunction, QueryType } from '~/querier/types.ts';
import type { BuilderInterface, RawClauseInterface, SelectClauseInterface } from '~/querier/interfaces.ts';

import { Descriptor, Objector } from '@zeero/commons';

import isQueryFunction from '~/querier/guards/is-query-function.guard.ts';
import isRaw from '~/querier/guards/is-raw.guard.ts';
import isBuilder from '~/querier/guards/is-builder.guard.ts';

@Descriptor({ properties: { enumerable: false } })
export class Select<T extends BuilderInterface<T>> implements SelectClauseInterface<T> {
  public columns: Array<AliasColumnType> = [];

  constructor(
    private _querier: T,
    private key: string = '',
  ) {}

  public hasColumns(): boolean {
    return this.columns.length > 0;
  }

  public column(raw: RawClauseInterface<T>): this & T;
  public column(alias: string, raw: RawClauseInterface<T>): this & T;
  public column(alias: string, query: QueryFunction<T>): this & T;
  public column(name: string, alias?: string): this & T;
  public column(name: any, alias?: any): this & T {
    if (isQueryFunction(alias)) {
      this.columns.push({ name, alias: alias(this._querier.instantiate()) });
    }

    if (alias) {
      this.columns.push({ name, alias });
    } else {
      this.columns.push({ name });
    }

    return Objector.assign(this._querier, this);
  }

  public query(options: QueryType): QueryType {
    const text: Array<string> = [];

    if (this.hasColumns()) {
      text.push(this.key);
      text.push(
        this.columns.map((column) => {
          if (isBuilder(column.alias)) {
            const q = column.alias.toQuery(options);
            return `(${q.text}) AS ${column.name}`;
          }

          if (isRaw(column.alias)) {
            return `${column.alias.query(options).text} AS ${column.name}`;
          }

          if (isRaw(column.name)) {
            return column.name.query(options).text;
          }

          return [
            column.name,
            column.alias ? ` AS ${column.alias}` : undefined,
          ].join('');
        }).join(', '),
      );
    }

    return {
      ...options,
      args: options.args,
      text: text.filter((s) => !!s).join(' '),
    };
  }
}

export default Select;
