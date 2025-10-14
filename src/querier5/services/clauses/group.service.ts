import type { QuerierOptionsType } from '~/querier/types.ts';
import type { CommonInterface, GroupInterface, RawInterface } from '~/querier/interfaces.ts';

import isRaw from '~/querier/guards/is-raw.guard.ts';

export class Group<T extends CommonInterface> implements GroupInterface<T> { 
  public groups: Array<string> = []
  
  constructor(
    protected querier: T,
    protected groupKey: string = 'GROUP'
  ) {}

  hasGroups(): boolean {
    return this.groups.length > 0
  }

  column(raw: RawInterface<T>): this & T;
  column(name: string): this & T;
  column(name: any): this & T {
    this.groups.push(name);

    return this.querier.queue(this)
  }

  toGroupQuery(options: QuerierOptionsType): QuerierOptionsType {

    let text = '';

    if (this.hasGroups()) {
      text = [
        this.groupKey,
        'BY',
        this.groups.map((name) => {
  
          if (isRaw(name)) {
            return `${name.toRawQuery(options).text} ${name.key.toUpperCase()}`
          }
  
          return `${name}`
        }).join(', '),
      ].filter((s) => !!s).join(' ');
    }

    return { ...options, text }
  }
  
}

export default Group