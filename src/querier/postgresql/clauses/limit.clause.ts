import type { BuilderInterface, LimitClauseInterface } from '~/querier/interfaces.ts';
import type { QueryType } from '~/querier/types.ts';

import { Objector, Descriptor } from '@zeero/commons';

@Descriptor({ properties: { enumerable: false } })
export class Limit<T extends BuilderInterface<T>> implements LimitClauseInterface<T> {
  private value: number | undefined

  constructor(
    private _querier: T,
    public key: string = 'LIMIT',
  ) {}

  hasLimit(): boolean {
    return typeof this.value !== 'undefined'
  }

  at(value: number): this & T;
  at(value: any): this & T {
    this.value = value

    return Objector.assign(this._querier, this);
  }

  public query(options: QueryType): QueryType {
    const text: Array<string> = [];

    if (this.hasLimit()) {
      text.push(this.key);
      text.push(String(this.value));
    }

    return { 
      ...options,
      args: options.args, 
      text: text.filter((s) => !!s).join(' ') 
    };
  }
}

export default Limit;
