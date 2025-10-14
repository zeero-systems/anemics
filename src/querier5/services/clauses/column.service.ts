import type { QuerierOptionsType } from '~/querier/types.ts';
import type { ColumnInterface, CommonInterface } from '~/querier/interfaces.ts';

import CharacterEnum from '~/storer/enums/character.enum.ts';
import DateEnum from '~/storer/enums/date.enum.ts';
import GeometricEnum from '~/storer/enums/geometric.enum.ts';
import LanguageEnum from '~/storer/enums/language.enum.ts';
import NetworkEnum from '~/storer/enums/network.enum.ts';
import NumericEnum from '~/storer/enums/numeric.enum.ts';
import RangeEnum from '~/storer/enums/range.enum.ts';
import StructureEnum from '~/storer/enums/structure.enum.ts';

export class Column<T extends CommonInterface> implements ColumnInterface<T> {
  public columnRow: {
    names: string | string[]
    type: string
    primary?: boolean
    unique?: boolean 
    null?: boolean
    default?: string | number
    collation?: string
    length?: number
    enums?: any[]
    scale?: number
    precision?: number
    table?: string
    fields?: string[]
  } = {} as any

  constructor(public querier: T) { }

  name(name: string | string[]): this & T {
    this.columnRow.names = name
    
    return this as any
  }
  character(type: CharacterEnum, options?: { length?: number }): this & T {
    this.columnRow.type = type
    this.columnRow.length = options?.length
    
    return this as any
  }
  structure(type: StructureEnum, options?: { enums?: any[] }): this & T {
    this.columnRow.type = type
    this.columnRow.enums = options?.enums

    return this as any
  }
  date(type: DateEnum, options?: { precision?: number }): this & T {
    this.columnRow.type = type
    this.columnRow.precision = options?.precision

    return this as any
  }
  geometric(type: GeometricEnum): this & T {
    this.columnRow.type = type

    return this as any
  }
  language(type: LanguageEnum): this & T {
    this.columnRow.type = type

    return this as any
  }
  network(type: NetworkEnum): this & T {
    this.columnRow.type = type

    return this as any
  }
  numeric(type: NumericEnum, options?: { precision?: number; scale?: number }): this & T {
    this.columnRow = {
      ...this.columnRow,
      ...options,
      type,
    }

    return this as any
  }
  range(type: RangeEnum): this & T {
    this.columnRow.type = type

    return this as any
  }
  primary(): this & T {
    this.columnRow.primary = true

    return this as any
  }
  unique(): this & T {
    this.columnRow.unique = true

    return this as any
  }
  nullable(value: boolean): this & T {
    this.columnRow.null = value

    return this as any
  }
  default(value: string | number): this & T {
    this.columnRow.default = value

    return this as any
  }
  collation(value: string): this & T {
    this.columnRow.collation = value

    return this as any
  }

  toColumnQuery(options: QuerierOptionsType): QuerierOptionsType {
    let type = this.columnRow.type.toUpperCase()

    if (this.columnRow.length) {
      type = `${type}(${this.columnRow.length})`
    }

    if (this.columnRow.precision) {
      type = `${type}(${this.columnRow.precision}, ${this.columnRow.scale})`
    }
    
    const text = []

    if (!Array.isArray(this.columnRow.names)) {
      this.columnRow.names = [this.columnRow.names]
    }
    
    for (const name of this.columnRow.names) {
      text.push(
        name,
        type,
        this.columnRow.unique ? 'UNIQUE' : '',
        this.columnRow.null === false ? 'NOT NULL' : '',
        this.columnRow.primary ? 'PRIMARY KEY' : '',
        this.columnRow.collation ? `COLLATE ${this.columnRow.collation}` : '',
        this.columnRow.default ? `DEFAULT ${this.columnRow.default}` : '',
      )
    }


    return { ...options, text: text.filter(s => !!s).join(' ') }
  }
}

export default Column
