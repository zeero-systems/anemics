import { OrderInterface, QuerierInterface, RawInterface } from '~/querier/interfaces.ts';
import { OrderType, QueryOptionType, QueryType } from '~/querier/types.ts';
import isRaw from '~/querier/guards/is-raw.guard.ts';
import assign from '~/querier/functions/assign.function.ts';

export class Order implements OrderInterface { 
  public orders: Array<OrderType> = []
  
  constructor(
    protected query: QuerierInterface,
    protected orderKey: string = 'ORDER'
  ) {}

  hasOrders(): boolean {
    return this.orders.length > 0
  }

  asc(raw: RawInterface): this & QuerierInterface;
  asc(name: string): this & QuerierInterface;
  asc(name: any): this & QuerierInterface {
    this.orders.push({ key: 'ASC', name });

    return assign(this.query.useClause(this), this.query)
  }

  desc(raw: RawInterface): this & QuerierInterface;
  desc(name: string): this & QuerierInterface;
  desc(name: any): this & QuerierInterface {
    this.orders.push({ key: 'DESC', name });

    return assign(this.query.useClause(this), this.query)
  }  

  toOrderQuery(options: QueryOptionType): QueryType {

    let text = '';

    if (this.hasOrders()) {
      text = [
        this.orderKey,
        'BY',
        this.orders.map((order) => {
  
          if (isRaw(order.name)) {
            return `${order.name.toRawQuery(options).text} ${order.key}`
          }
  
          return `${order.name} ${order.key}`
        }).join(', '),
      ].filter((s) => !!s).join(' ');
    }

    return { text, ...options }
  }
  
}

export default Order