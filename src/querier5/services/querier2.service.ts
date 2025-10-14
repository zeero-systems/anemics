import assign from '../functions/assign.function.ts';

export type ValueType = string;

export type TableType = {
  name?: ValueType;
  alias?: string;
};

export type QueryType = {
  args: Array<string | number>;
  text: string;
};

export type ClauseType = { name: string; target: any };

export interface QuerierInterface {
  clauses: Array<{ previous?: ClauseType; current: ClauseType }>;
  queue(clause: ClauseType): any;
  toQuery(): QueryType;
}

export interface QueryInterface {
  get select(): SelectInterface<QueryInterface>;
  get from(): FromInterface<QueryInterface>;
  get raw(): RawInterface<QueryInterface>;
}

export class QueryBuilder implements QueryInterface, QuerierInterface {
  public clauses: Array<{ previous?: ClauseType; current: ClauseType }> = [];

  constructor() {}

  public get select(): SelectInterface<QueryInterface> {
    return this.queue({ name: 'Select', target: new Select(this, 'SELECT') });
  }

  public get from(): FromInterface<QueryInterface> {
    return this.queue({ name: 'From', target: new From(this, 'FROM') });
  }

  public get raw(): RawInterface<QueryInterface> {
    return this.queue({ name: 'Raw', target: new Raw(this) });
  }

  public queue(clause: ClauseType): any {
    if (this.clauses.length > 0 && clause.name == 'Raw') {
      this.clauses.push({ previous: this.clauses[this.clauses.length - 1].current, current: clause });
    } else {
      this.clauses.push({ current: clause });
    }
    return clause.target;
  }

  public clausesOrdered(): any[] {
    const clauseOrder = ['Select', 'From', 'Where', 'GroupBy', 'Having', 'OrderBy'];

    const ordered: Array<ClauseType> = [];
    const wasOrdered = new Set<number>();

    if (
      this.clauses.length > 0 &&
      this.clauses[0].current.name === 'Raw'
    ) {
      ordered.push(this.clauses[0].current);
      wasOrdered.add(0);
    }

    for (const name of clauseOrder) {
      let idx = 0;
      while (idx < this.clauses.length) {
        if (
          !wasOrdered.has(idx) &&
          this.clauses[idx].current.name === name
        ) {
          ordered.push(this.clauses[idx].current);
          wasOrdered.add(idx);

          let rawIdx = 0;
          while (rawIdx < this.clauses.length) {
            if (
              !wasOrdered.has(rawIdx) &&
              this.clauses[rawIdx].current.name === 'Raw' &&
              this.clauses[rawIdx].previous &&
              this.clauses[rawIdx].previous === this.clauses[idx].current
            ) {
              ordered.push(this.clauses[rawIdx].current);
              wasOrdered.add(rawIdx);
            }
            rawIdx++;
          }
        }
        idx++;
      }
    }

    return ordered
  }

  public toQuery(): QueryType {
    const text: Array<string> = [];
    const ordered = this.clausesOrdered()

    if (ordered.length > 0) {
      text.push(
        ordered.map((clause) => {
          return clause.target.query().text;
        }).join(' '),
      );
    }

    return {
      args: [],
      text: text.filter((s) => !!s).join(' '),
    };
  }
}

export interface RawInterface<T> {
  text(value: string): this & T;
  query(): QueryType;
}

export class Raw<T> implements RawInterface<T> {
  protected value: string = '';

  constructor(public record: T) {}

  public hasText(): boolean {
    return !!this.value;
  }

  public text(value: string): this & T {
    this.value = value;
    return assign(this.record, this);
  }

  public query(): QueryType {
    const text: Array<string> = [];

    if (this.hasText()) {
      text.push(this.value);
    }

    return {
      args: [],
      text: text.filter((s) => !!s).join(' '),
    };
  }
}

export interface SelectInterface<T> {
  column(name: any, alias?: any): this & T;
  query(): QueryType;
}

export class Select<T> implements SelectInterface<T> {
  protected columns: Array<TableType> = [];

  constructor(
    public record: T,
    public key: 'SELECT',
  ) {}

  public hasColumns(): boolean {
    return this.columns.length > 0;
  }

  public column(name: any, alias?: any): this & T {
    this.columns.push({ name, alias });
    return assign(this.record, this);
  }

  public query(): QueryType {
    const text: Array<string> = [];

    if (this.hasColumns()) {
      text.push(this.key);
      text.push(
        this.columns.map((column) => {
          return [
            column.name,
            column.alias ? ` AS ${column.alias}` : undefined,
          ].join('');
        }).join(', '),
      );
    }

    return {
      args: [],
      text: text.filter((s) => !!s).join(' '),
    };
  }
}

export interface FromInterface<T> {
  table(name: any, alias?: any): this & T;
  query(): QueryType;
}

export class From<T> implements FromInterface<T> {
  protected tables: Array<TableType> = [];

  constructor(
    public record: T,
    public key: 'FROM',
  ) {}

  public hasTables(): boolean {
    return this.tables.length > 0;
  }

  public table(name: any, alias?: any): this & T {
    this.tables.push({ name, alias });
    return assign(this.record, this);
  }

  public query(): QueryType {
    const text: Array<string> = [];

    if (this.hasTables()) {
      text.push(this.key);
      text.push(
        this.tables.map((column) => {
          return [
            column.name,
            column.alias ? ` AS ${column.alias}` : undefined,
          ].join('');
        }).join(', '),
      );
    }

    return {
      args: [],
      text: text.filter((s) => !!s).join(' '),
    };
  }
}

export default QueryBuilder;
