import { OrderInterface } from '~/querier/interfaces.ts';
import Order from '~/querier/services/clauses/order.service.ts';

export const isOrder = (x: any): x is OrderInterface<any> => {
  return x instanceof Order
}

export default isOrder
