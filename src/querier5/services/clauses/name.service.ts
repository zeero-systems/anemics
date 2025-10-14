import type { QuerierOptionsType, ValueType } from '~/querier/types.ts';
import type { NameInterface, CommonInterface } from '~/querier/interfaces.ts';

import isQuerier from '~/querier/guards/is-querier.guard.ts';
import isRawwer from '~/querier/guards/is-raw.guard.ts';

export class Name<T extends CommonInterface> implements NameInterface<T> {
  
  public nameText: ValueType = ''
  
  constructor(protected querier: T) { }

  hasName(): boolean {
    return !!this.nameText
  }

  name(name: ValueType): this & T {
    this.nameText = name
    return this.querier.queue(this)
  }

  toNameQuery(options: QuerierOptionsType): QuerierOptionsType {
    let text: string = ''

    if (isQuerier(this.nameText)) {
      text = this.nameText.toQuery(options).text
    }

    if (isRawwer(this.nameText)) {
      text = this.nameText.toRawQuery(options).text
    }

    if (typeof this.nameText == 'string') {
      text = this.nameText
    }

    return { ...options, text }
  }
  
}

export default Name