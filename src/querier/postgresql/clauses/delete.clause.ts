import type { QueryFunction, QueryType } from '~/querier/types.ts';
import type { BuilderInterface, DeleteClauseInterface, TableClauseInterface } from '~/querier/interfaces.ts';

import { Objector, Descriptor } from '@zeero/commons';

import Table from '~/querier/postgresql/clauses/table.clause.ts';

@Descriptor({ properties: { enumerable: false } })
export class Delete<T extends BuilderInterface<T>> implements DeleteClauseInterface<T> {
  public tabler: TableClauseInterface<T>;

  constructor(
    private _querier: T,
    private key: string = '',
  ) {
    this.tabler = new Table(this._querier, 'FROM');
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

  public query(options: QueryType): QueryType {
    const text: Array<string> = [];

    if (this.hasTables()) {
      text.push(this.key);
      text.push(this.tabler.query(options).text);
    }

    return {
      ...options,
      args: options.args,
      text: text.filter((s) => !!s).join(' '),
    };
  }
}

export default Delete;
