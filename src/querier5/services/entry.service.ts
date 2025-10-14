import type {
  JoinInterface,
  OrderInterface,
  EntryInterface,
  SelectInterface,
  FromInterface,
  RawwerInterface,
  WhereInterface,
  InsertInterface,
  UpdateInterface,
  DeleteInterface,
  GroupInterface,
} from '~/querier/interfaces.ts';
import type { ClauseInterface } from '~/querier/interfaces.ts';
import type { QuerierOptionsType } from '~/querier/types.ts';

import Select from '~/querier/services/clauses/select.service.ts';
import Order from '~/querier/services/clauses/order.service.ts';
import Join from '~/querier/services/clauses/join.service.ts';
import Rawwer from '~/querier/services/clauses/rawwer.service.ts';
import Where from '~/querier/services/clauses/where.service.ts';
import assign from '~/querier/functions/assign.function.ts';
import From from '~/querier/services/clauses/from.service.ts';
import Insert from './clauses/insert.service.ts';
import Update from './clauses/update.service.ts';
import Delete from './clauses/delete.service.ts';
import Group from './clauses/group.service.ts';

export class Entry implements EntryInterface {

  public from: FromInterface<EntryInterface> = new From(this)
  public select: SelectInterface<EntryInterface> = new Select(this)
  public insert: InsertInterface<EntryInterface> = new Insert(this)
  public update: UpdateInterface<EntryInterface> = new Update(this)
  public delete: DeleteInterface<EntryInterface> = new Delete(this)
  public where: WhereInterface<EntryInterface> = new Where(this)
  public get full(): JoinInterface<EntryInterface> { return assign(new Join(this, 'FULL'), this) }
  public get cross(): JoinInterface<EntryInterface> { return assign(new Join(this, 'CROSS'), this) }
  public get left(): JoinInterface<EntryInterface> { return assign(new Join(this, 'LEFT'), this) }
  public get right(): JoinInterface<EntryInterface> { return assign(new Join(this, 'RIGHT'), this) }
  public get inner(): JoinInterface<EntryInterface> { return assign(new Join(this, 'INNER'), this) }
  public order: OrderInterface<EntryInterface> = new Order(this)
  public group: GroupInterface<EntryInterface> = new Group(this)
  public raw: RawwerInterface<EntryInterface> = new Rawwer(this)

  public clauses: Array<ClauseInterface> = []

  constructor(public options: QuerierOptionsType = { args: [], text: '', placeholderType: 'counter' }) {
    this.from = assign(this.from, this)
    this.select = assign(this.select, this)
    this.insert = assign(this.insert, this)
    this.update = assign(this.update, this)
    this.delete = assign(this.delete, this)
    this.where = assign(this.where, this)

    // this.full = assign(this.full, this)
    // this.cross = assign(this.cross, this)
    // this.left = assign(this.left, this)
    // this.right = assign(this.right, this)
    // this.inner = assign(this.inner, this)

    this.order = assign(this.order, this)
    this.group = assign(this.group, this)
    this.raw = assign(this.raw, this)
  }

  public instantiate(): EntryInterface {
    return new Entry({ ...this.options })
  }

  public queue(clause: ClauseInterface): ClauseInterface {
    if (
      this.clauses.length == 0 ||
      this.clauses[this.clauses.length-1] != clause || 
      clause['toJoinQuery']
    ) {
      if (clause['toJoinQuery']) console.log(Deno.inspect(clause, { depth: 0 }))

      this.clauses.push(clause)
    }
    return clause
  }

  toQuery = (options: QuerierOptionsType = { args: [], text: '', placeholderType: 'counter' }): QuerierOptionsType => {
    
    this.options = options = {  ...this.options, ...options }
    
    // const queries = [
    //   'toUpdateQuery',
    //   'toSelectQuery',
    //   'toDeleteQuery',
    //   'toInsertQuery',
    //   'toFromQuery',
    //   'toWhereQuery',
    //   'toJoinQuery',
    //   'toGroupQuery',
    //   'toOrderQuery',
    //   'toRawQuery',
    // ]

    options.steps = []

    console.log('this.clauses', Deno.inspect(this.clauses, { depth: 0 }))


    let counter = 0
    const returning: string[] = []
    const columnNames: string[] = []

    const toText = (to: string, ): string => {
      const clause = this.clauses.find((clause) => clause[to])

      if (clause) {
        const q = clause[to](this.options)
        options.steps?.push(to)
  
        if (q.returning) { returning.push(...q.returning) }
        if (q.columnNames) { columnNames.push(...q.columnNames) }
        
        counter++
        
        return q.text
      } 

      const rawClause = this.clauses.find((clause, index) => clause.toRawQuery && index == counter)
      if (rawClause) {
        const q = rawClause.toRawQuery(this.options)
        options.steps?.push('toRawQuery')
  
        if (q.returning) { returning.push(...q.returning) }
        if (q.columnNames) { columnNames.push(...q.columnNames) }

        return q.text
      }

      return ''
    }

    const text = [
      toText('toUpdateQuery'),
      toText('toSelectQuery'),
      toText('toDeleteQuery'),
      toText('toInsertQuery'),
      toText('toFromQuery'),
      toText('toWhereQuery'),
      toText('toJoinQuery'),
      toText('toGroupQuery'),
      toText('toOrderQuery'),
      toText('toRawQuery'),
      returning.length > 0 ? `RETURNING ${returning.join(', ')}` : ''
    ]

    return {
      ...options,
      text: text.filter(s => !!s).join(' '),
      columnNames,
      returning
    }
  };
}

export default Entry
