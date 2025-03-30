import { FromInterface, JoinInterface, OrderInterface, QuerierInterface, SelectInterface, StatementInterface } from '~/querier/interfaces.ts';
import From from '~/querier/services/from.servive.ts';
import Select from '~/querier/services/select.service.ts';
import { QuerierOptionType, QueryArgType, QueryType } from '~/querier/types.ts';
import Order from '~/querier/services/order.servive.ts';
import Statement from '~/querier/services/statement.service.ts';
import Join from '~/querier/services/join.servive.ts';

export class Querier implements QuerierInterface {
   
  constructor(
    public options?: QuerierOptionType,
    public from: FromInterface = new From(this),
    public select: SelectInterface = new Select(this),
    public where: StatementInterface = new Statement(this),
    public join: JoinInterface = new Join(this),
    public order: OrderInterface = new Order(this),
  ) {} 
  
  public getQuery = (options: QueryArgType = { args: [], counter: 0, placeholderType: 'counter' }): QueryType => {
    const isRoot = 
      this.select.statement.columns.length > 0 &&
      this.from.statement.length > 0

    options = { ...options, ...this.options }

    const select = this.select.toQuery(options)
    const from = this.from.toQuery(options)
    const where = this.where.toQuery(options)
    const join = this.join.toQuery(options)
    const order = this.order.toQuery(options)

    return {
      text: [
        isRoot && 'SELECT', select.text,
        isRoot && 'FROM', from.text,
        isRoot && where.text && 'WHERE', where.text,
        isRoot && join.text && join.text,
        isRoot && order.text && 'ORDER BY', order.text
      ].filter(s => !!s).join(' '),
      ...options
    }
  }

}

export default Querier

// @todo

// anemics
// refactor to be able to use only specifics parts of the systems

// anemics: querier
// test performance usign object.assign. Change class methods to properties to use spreding
// x add parameters to the currente implementation with counter of placeholders, even the recursive ones
// x put everything in files
// add tests for a more use cases
// - implement a lot more of the sql syntax
// add raw to everything added until now
// add skipBinding to everything added until now

// anemics: databaser
// implement a mongodb driver
// implement a query builder for it

// commons
// refactor to be able to use only specifics parts of the systems
// implement a lot of more validators
