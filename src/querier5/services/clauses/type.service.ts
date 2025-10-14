import type { QuerierOptionsType } from '~/querier/types.ts';
import type { TypeInterface, RawInterface, CommonInterface } from '~/querier/interfaces.ts';

export class Type<T extends CommonInterface> implements TypeInterface<T> {
  public key: string = ''
  
  constructor(
    protected querier: T,
    protected indexKey: string = 'USING'
  ) {}

  type(raw: RawInterface<T>): T;
  type(type: string): T;
  type(type: any): T {
    this.key = type

    return this.querier.queue(this)
  }

  toTypeQuery(options: QuerierOptionsType): QuerierOptionsType {
    let text = ''

    if (this.key) {
      text = [
        this.indexKey,
        this.key
      ].filter((t) => !!t).join(' ')
    }
    
    return { ...options, text }
  }
  
}

export default Type
