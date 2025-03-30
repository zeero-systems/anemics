import { OrderInterface, QuerierInterface } from '~/querier/interfaces.ts';
import { OrderStatementType, QueryArgType, QueryType } from '~/querier/types.ts';

export class Order implements OrderInterface {
  constructor(
    public query: QuerierInterface,
    public statement: OrderStatementType = { columns: [] }
  ) {}

  asc(name: string): this & QuerierInterface {
    this.statement.columns.push({ key: 'ASC', name });

    return Object.assign(this, this.query);
  }
  desc(name: string): this & QuerierInterface {
    this.statement.columns.push({ key: 'DESC', name });

    return Object.assign(this, this.query);
  }  

  toQuery(options: QueryArgType): QueryType {

    const text = [
      this.statement.columns.map((order) => {
        return `${order.name} ${order.key}`
      }).join(', '),
    ].filter((s) => !!s).join('');

    return { text, ...options }
  }
  
}

export default Order