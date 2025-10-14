import type { OrderType } from '~/querier/types.ts';
import type { QuerierOptionsType } from '~/querier/types.ts';
import type { CommonInterface, OrderInterface, RawInterface } from '~/querier/interfaces.ts';

import isRaw from '~/querier/guards/is-raw.guard.ts';

export class Order<T extends CommonInterface> implements OrderInterface<T> { 
  public orders: Array<OrderType> = []
  
  constructor(
    protected querier: T,
    protected orderKey: string = 'ORDER'
  ) {}

  hasOrders(): boolean {
    return this.orders.length > 0
  }

  asc(raw: RawInterface<T>): this & T;
  asc(name: string): this & T;
  asc(name: any): this & T {
    this.orders.push({ key: 'asc', name });

    return this.querier.queue(this)
  }

  desc(raw: RawInterface<T>): this & T;
  desc(name: string): this & T;
  desc(name: any): this & T {
    this.orders.push({ key: 'desc', name });

    return this.querier.queue(this)
  }  

  toOrderQuery(options: QuerierOptionsType): QuerierOptionsType {

    let text = '';

    if (this.hasOrders()) {
      text = [
        this.orderKey,
        'BY',
        this.orders.map((order) => {
  
          if (isRaw(order.name)) {
            return `${order.name.toRawQuery(options).text} ${order.key.toUpperCase()}`
          }
  
          return `${order.name} ${order.key.toUpperCase()}`
        }).join(', '),
      ].filter((s) => !!s).join(' ');
    }

    return { ...options, text }
  }
  
}

export default Order