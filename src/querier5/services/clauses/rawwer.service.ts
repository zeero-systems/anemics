import { CommonInterface, RawwerInterface } from '~/querier/interfaces.ts';
import { QuerierOptionsType } from '~/querier/types.ts';

export class Rawwer<T extends CommonInterface> implements RawwerInterface<T> {
  
  protected rawText: string = ''
  
  constructor(protected querier: T) { }

  text(value: string): this & T {
    this.rawText = value
    return this.querier.queue(this)
  }

  toRawQuery(options: QuerierOptionsType): QuerierOptionsType {
    return { ...options, text: this.rawText }
  }
}

export default Rawwer