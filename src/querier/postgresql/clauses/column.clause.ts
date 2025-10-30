import type { ColumnType, QueryType } from '~/querier/types.ts';
import type { BuilderInterface, ColumnClauseInterface } from '~/querier/interfaces.ts';

import { Descriptor, Objector } from '@zeero/commons';
import Constraint from '~/querier/postgresql/clauses/constraint.clause.ts';
import {
  CharacterType,
  DateType,
  GeometricType,
  LanguageType,
  NetworkType,
  NumericType,
  RangeType,
  StructureType,
} from '~/querier/types.ts';

@Descriptor({ properties: { enumerable: false } })
export class Column<T extends BuilderInterface<T>> implements ColumnClauseInterface<T> {
  public row: ColumnType<T> = { constraints: [] as any } as ColumnType<T>;

  constructor(
    private _querier: T,
    public key: string = '',
  ) {}

  public hasColumn(): boolean {
    return !!this.row.name;
  }

  public name(value: string): this & T {
    this.row.name = value;
    return Objector.assign(this._querier, this);
  }

  public primaryKey(): this & T {
    const constraint = new Constraint(this._querier);
    constraint.primaryKey(true);
    this.row.constraints.push(constraint);
    return Objector.assign(this._querier, this);
  }

  public default(value: string | number | Array<string | number>): this & T {
    const constraint = new Constraint(this._querier);
    constraint.default(value);
    this.row.constraints.push(constraint);
    return Objector.assign(this._querier, this);
  }

  public unique(value?: string | Array<string>): this & T {
    const constraint = new Constraint(this._querier);
    // If no value provided, pass true for column-level UNIQUE
    // Otherwise pass the column names for table-level constraint
    constraint.unique(value !== undefined ? value : true);
    this.row.constraints.push(constraint);
    return Objector.assign(this._querier, this);
  }

  public notNull(): this & T {
    this.row.notNull = true;
    return Objector.assign(this._querier, this);
  }

  public character(value: CharacterType, options?: { length?: number }): this & T {
    this.row.type = value;
    this.row.length = options?.length;
    return Objector.assign(this._querier, this);
  }

  public date(value: DateType, options?: { precision?: number }): this & T {
    this.row.type = value;
    this.row.precision = options?.precision;
    return Objector.assign(this._querier, this);
  }
  public geometric(value: GeometricType): this & T {
    this.row.type = value;
    return Objector.assign(this._querier, this);
  }
  public language(value: LanguageType): this & T {
    this.row.type = value;
    return Objector.assign(this._querier, this);
  }
  public network(value: NetworkType): this & T {
    this.row.type = value;
    return Objector.assign(this._querier, this);
  }
  public numeric(value: NumericType, options?: { scale?: number; precision?: number }): this & T {
    this.row.type = value;
    this.row.scale = options?.scale;
    this.row.precision = options?.precision;
    return Objector.assign(this._querier, this);
  }
  public range(value: RangeType): this & T {
    this.row.type = value;
    return Objector.assign(this._querier, this);
  }
  public structure(value: StructureType, options?: { enums?: any[] }): this & T {
    this.row.type = value;
    this.row.enums = options?.enums;
    return Objector.assign(this._querier, this);
  }

  public query(options: QueryType): QueryType {
    const text: Array<string> = [];

    if (this.hasColumn()) {
      text.push(this.key);
      text.push(this.row.name);
      let type = String(this.row.type).toUpperCase();

      if (this.row.length) {
        type = `${type}(${this.row.length})`;
      }
      if (this.row.enums) {
        type = `${type}(${this.row.enums.map((v) => `'${v}'`).join(', ')})`;
      }
      if (this.row.precision && this.row.scale) {
        type = `${type}(${this.row.precision}, ${this.row.scale})`;
      }

      text.push(type);

      if (this.row.notNull) {
        text.push('NOT NULL');
      }

      if (this.row.collation) {
        text.push(`COLLATE ${this.row.collation}`);
      }

      for (const constraint of this.row.constraints) {
        text.push(constraint.query(options).text);
      }
    }

    return {
      ...options,
      args: options.args,
      text: text.filter((s) => !!s).join(' '),
    };
  }
}

export default Column;
