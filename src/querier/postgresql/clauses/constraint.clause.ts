import type { ConstraintType, QueryType } from '~/querier/types.ts';
import type { BuilderInterface, ConstraintClauseInterface } from '~/querier/interfaces.ts';

import { Descriptor, Objector } from '@zeero/commons';

import ForeingActionEnum from '~/querier/enums/foreign-action.enum.ts';

@Descriptor({ properties: { enumerable: false } })
export class Constraint<T extends BuilderInterface<T>> implements ConstraintClauseInterface<T> {
  public value: ConstraintType = {} as ConstraintType;

  constructor(
    private _querier: T,
    public key: string = '',
  ) {}

  public hasConstraint(): boolean {
    return Object.keys(this.value).length > 0;
  }

  name(value: string): this & T {
    this.value.name = value;
    return Objector.assign(this._querier, this);
  }

  default(column: string | number | Array<string | number>): this & T {
    this.value.default = column;
    return Objector.assign(this._querier, this);
  }

  primaryKey(column: string | Array<string> | boolean): this & T {
    if (typeof column === 'string' && !Array.isArray(column)) column = [column];
    this.value.primaryKey = column;
    return Objector.assign(this._querier, this);
  }

  check(condition: string): this & T {
    this.value.check = condition;
    return Objector.assign(this._querier, this);
  }

  unique(column: string | boolean | Array<string>): this & T {
    let normalized: boolean | Array<string>;
    // If column is a non-empty string, wrap it in an array for table-level constraint
    if (typeof column === 'string' && column.length > 0 && !Array.isArray(column)) {
      normalized = [column];
    } else if (typeof column === 'string' && column.length === 0) {
      // If column is empty string, treat as boolean true for column-level constraint
      normalized = true;
    } else if (typeof column === 'boolean') {
      normalized = column;
    } else {
      normalized = column as Array<string>;
    }
    this.value.unique = normalized;
    return Objector.assign(this._querier, this);
  }

  foreignKey(column: string | Array<string>): this & T {
    if (!Array.isArray(column)) column = [column];
    this.value.foreignKey = column;
    return Objector.assign(this._querier, this);
  }

  references(table: string, options: { column: string | string[] }): this & T {
    let column = options.column;
    if (!Array.isArray(column)) column = [column];
    this.value.references = { table, column };
    return Objector.assign(this._querier, this);
  }

  onUpdate(action: ForeingActionEnum): this & T {
    this.value.onUpdate = action;
    return Objector.assign(this._querier, this);
  }

  onDelete(action: ForeingActionEnum): this & T {
    this.value.onDelete = action;
    return Objector.assign(this._querier, this);
  }

  public query(options: QueryType): QueryType {
    const text: Array<string> = [];

    if (this.hasConstraint()) {
      if (this.value.name) {
        text.push(this.key);
        text.push(this.value.name);
      }
      if (this.value.default) {
        if (Array.isArray(this.value.default)) {
          text.push(`DEFAULT '{${this.value.default.map((v) => `"${v}"`).join(',')}}'`);
        } else if (typeof this.value.default === 'string') {
          // Quote string defaults, but don't quote keywords like CURRENT_TIMESTAMP
          const upperValue = this.value.default.toUpperCase();
          if (
            upperValue === 'CURRENT_TIMESTAMP' || upperValue === 'NOW()' || upperValue === 'NULL' ||
            upperValue === 'DEFAULT'
          ) {
            text.push(`DEFAULT ${this.value.default}`);
          } else {
            text.push(`DEFAULT '${this.value.default}'`);
          }
        } else {
          // Numbers don't need quotes
          text.push(`DEFAULT ${this.value.default}`);
        }
      }
      if (this.value.primaryKey) {
        text.push('PRIMARY KEY');
        if (typeof this.value.primaryKey !== 'boolean') {
          text.push(`(${this.value.primaryKey})`);
        }
      }
      if (this.value.check) {
        text.push(`CHECK (${this.value.check})`);
      }
      if (this.value.unique) {
        text.push(`UNIQUE`);
        if (typeof this.value.unique !== 'boolean') {
          text.push(`(${this.value.unique.join(',')})`);
        }
      }
      if (this.value.foreignKey) {
        text.push(`FOREIGN KEY (${this.value.foreignKey.join(',')})`);
      }
      if (this.value.references) {
        text.push(`REFERENCES`);
        text.push(`${this.value.references.table}(${this.value.references.column.join(',')})`);
      }
      if (this.value.onUpdate) {
        text.push(`ON UPDATE ${this.value.onUpdate.toUpperCase()}`);
      }
      if (this.value.onDelete) {
        text.push(`ON DELETE ${this.value.onDelete.toUpperCase()}`);
      }
    }

    return {
      ...options,
      args: options.args,
      text: text.filter((s) => !!s).join(' '),
    };
  }
}

export default Constraint;
