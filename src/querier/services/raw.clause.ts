import type { QueryType } from '~/querier/types.ts';
import type { RawClauseInterface } from '~/querier/interfaces.ts';

import { Objector, Descriptor } from '@zeero/commons';

@Descriptor({ properties: { enumerable: false }})
export class Raw<T> implements RawClauseInterface<T> {
  
  constructor(public text: string, private _querier?: T) {}

  public hasText(): boolean {
    return !!this.value;
  }

  public value(value: string): this & T {
    this.text = value;
    return Objector.assign(this._querier, this);
  }

  public query(options: QueryType): QueryType {
    const text: Array<string> = [];

    if (this.hasText()) {
      text.push(this.text);
    }

    return {
      ...options,
      args: options.args,
      text: text.filter((s) => !!s).join(' '),
    };
  }
}

export default Raw
