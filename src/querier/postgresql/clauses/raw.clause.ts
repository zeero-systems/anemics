import type { QueryType } from '~/querier/types.ts';
import type { RawClauseInterface } from '~/querier/interfaces.ts';

import Builder from '~/querier/services/builder.services.ts';
import Descriptor from '~/querier/decorations/descriptor.decoration.ts';

@Descriptor({ properties: { enumerable: false }})
export class Raw<T> implements RawClauseInterface<T> {
  public text: string = '';

  constructor(private _querier: T) {}

  public hasText(): boolean {
    return !!this.value;
  }

  public value(value: string): this & T {
    this.text = value;
    return Builder.assign(this._querier, this);
  }

  public query(options: QueryType): QueryType {
    const text: Array<string> = [];

    if (this.hasText()) {
      text.push(this.text);
    }

    return {
      args: [],
      text: text.filter((s) => !!s).join(' '),
    };
  }
}

export default Raw
