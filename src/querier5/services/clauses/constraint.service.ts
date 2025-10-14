import type { QuerierOptionsType } from '~/querier/types.ts';
import type { CommonInterface, ConstraintInterface } from '~/querier/interfaces.ts';
import ForeingActionEnum from '~/querier/enums/foreign-action.enum.ts';

export class Constraint<T extends CommonInterface> implements ConstraintInterface<T> {
  public constraintRow: {
    type?: string
    names: string | string[]
    columns: string | string[]
    onDelete?: ForeingActionEnum
    onUpdate?: ForeingActionEnum
    table?: string
    fields?: string[]
  } = {} as any

  constructor(public querier: T) { }

  name(name: string | string[]): this & T {
    this.constraintRow.names = name
    
    return this as any
  }

  foreingKey(name: string | string[]): this & T {
    this.constraintRow.columns = name
    
    return this as any
  }

  references(table: string, options: { field: string | string[] }): this & T {
    this.constraintRow = {
      ...this.constraintRow,
      ...options,
      table,
      fields: Array.isArray(options.field) ? options.field : [options.field],
      type: 'references',
    }

    return this as any
  }

  onUpdate(action: ForeingActionEnum): this & T {
    this.constraintRow.onUpdate = action
    return this as any
  }

  onDelete(action: ForeingActionEnum): this & T {
    this.constraintRow.onDelete = action
    return this as any
  }

  toConstraintQuery(options: QuerierOptionsType): QuerierOptionsType {

    if (Array.isArray(this.constraintRow.names)) {
      this.constraintRow.names = this.constraintRow.names[0]
    }

    if (!Array.isArray(this.constraintRow.columns)) {
      this.constraintRow.columns = [this.constraintRow.columns]
    }

    const text = [
      this.constraintRow.names ? `CONSTRAINT ${this.constraintRow.names}` : '',
      this.constraintRow.type == 'references' ? 'FOREIGN KEY' : '',
      `(${this.constraintRow.columns.join(', ')})`,
      'REFERENCES',
      `${this.constraintRow.table}(${this.constraintRow.fields?.join(',')})`,
      this.constraintRow.onUpdate ? `ON UPDATE ${this.constraintRow.onUpdate.toUpperCase()}` : '',
      this.constraintRow.onDelete ? `ON DELETE ${this.constraintRow.onDelete.toUpperCase()}` : '',
    ]

    return { ...options, text: text.filter(s => !!s).join(' ') }
  }
}

export default Constraint
