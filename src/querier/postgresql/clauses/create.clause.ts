import type { CreateType, QueryType } from '~/querier/types.ts';
import type { BuilderInterface, CreateClauseInterface, NameClauseInterface } from '~/querier/interfaces.ts';

import { Descriptor, Objector } from '@zeero/commons';

import Name from '~/querier/postgresql/clauses/name.clause.ts';

@Descriptor({ properties: { enumerable: false } })
export class Create<T extends BuilderInterface<T>> implements CreateClauseInterface<T> {
  public creates: CreateType = {} as CreateType;
  public namer: NameClauseInterface<T>;

  constructor(
    private _querier: T,
    public key: string = '',
  ) {
    this.namer = new Name(this._querier);
  }

  public hasName(): boolean {
    return !!this.namer.hasName();
  }

  public hasCreate(): boolean {
    return !!this.namer.hasName();
  }

  public name(value: string): this & T {
    this.namer.name(value);
    return Objector.assign(this._querier, this);
  }

  public notExists(): this & T {
    this.creates.exists = false;
    return Objector.assign(this._querier, this);
  }

  public query(options: QueryType): QueryType {
    const text: Array<string> = [];

    if (this.hasCreate()) {
      text.push(this.key);

      if (this.creates.exists === false) {
        text.push(`IF NOT EXISTS`);
      }

      text.push(this.namer.query(options).text);
    }

    return {
      ...options,
      args: options.args,
      text: text.filter((s) => !!s).join(' '),
    };
  }
}

export default Create;
