import type { BuilderOptionsType, ClauseType, QueryType } from '~/querier/types.ts';
import type {
  TableQuerierInterface,
  RawClauseInterface,
  ColumnClauseInterface,
  ConstraintClauseInterface,
  DropClauseInterface,
  SelectClauseInterface,
  CreateClauseInterface,
} from '~/querier/interfaces.ts';

import Column from '~/querier/postgresql/clauses/column.clause.ts';
import Constraint from '~/querier/postgresql/clauses/constraint.clause.ts';
import Drop from '~/querier/postgresql/clauses/drop.clause.ts';
import Raw from '../../services/raw.clause.ts';
import Return from '../../services/return.clause.ts';
import Builder from '../../services/builder.services.ts';
import Create from '../clauses/create.clause.ts';

export class TableQuerier implements TableQuerierInterface {
  public clauses: Array<{ previous?: ClauseType; current: ClauseType }> = [];
  public columnIndex!: number

  constructor(public options: BuilderOptionsType = { args: [], text: '' }) { }

  public use(options: BuilderOptionsType): TableQuerierInterface {
    this.options = options;
    return this;
  }

  public instantiate(): TableQuerierInterface {
    return new TableQuerier();
  }

  public get create(): CreateClauseInterface<TableQuerierInterface> {
    return this.queue({ name: 'Create', target: new Create<TableQuerierInterface>(this, 'CREATE TABLE') });
  }

  public get drop(): DropClauseInterface<TableQuerierInterface> {
    return this.queue({ name: 'Drop', target: new Drop<TableQuerierInterface>(this, 'DROP TABLE') });
  }

  public get column(): ColumnClauseInterface<TableQuerierInterface> {
    const target = new Column<TableQuerierInterface>(this, '')
    if (typeof this.columnIndex === 'undefined') {
      this.columnIndex = this.clauses.length
      this.queue({ name: 'Columns', target: [target] });
    } else {
      this.clauses[this.columnIndex].current.target.push(target)
    }
    return target
  }

  public get constraint(): ConstraintClauseInterface<TableQuerierInterface> {
    return this.queue({ name: 'Constraint', target: new Constraint<TableQuerierInterface>(this, 'CONSTRAINT') });
  }

  public get raw(): RawClauseInterface<TableQuerierInterface> {
    return this.queue({ name: 'Raw', target: new Raw<TableQuerierInterface>('', this) });
  }

  public get returns(): SelectClauseInterface<TableQuerierInterface> {
    return this.queue({ name: 'Return', target: new Return<TableQuerierInterface>(this) });
  }

  public queue(clause: ClauseType): any {
    if (this.clauses.length > 0 && clause.name == 'Raw') {
      this.clauses.push({ previous: this.clauses[this.clauses.length - 1].current, current: clause });
    } else {
      this.clauses.push({ current: clause });
    }
    return clause.target;
  }

  private toGrouping(text: string): string {
    if (this.options.grouping) {
      if (this.options.grouping == 'brackets') return `[${text}]`;
      if (this.options.grouping == 'braces') return `{${text}}`;
      return `(${text})`;
    }

    return text;
  }

  public toQuery(options: QueryType = { args: [], returns: [], text: '' }): QueryType {
    const text: Array<string> = [];
    const ordered = Builder.sorter(this.clauses, ['Create', 'Drop', 'Columns', 'Constraint']);

    const opts = { ...this.options, ...options }

    if (ordered.length > 0) {
      text.push(ordered.shift()?.target.query(opts).text)

      const columns = ordered.map((clause) => {
        if (clause.name == 'Columns') {
          return `${clause.target.map((c: any) => c.query(opts).text).join(', ')}`;  
        }
        return clause.target.query(opts).text;
      }).join(', ')

      if (columns) {
        text.push(`(${columns})`);
      }
    }

    return {
      ...opts,
      args: opts.args,
      text: this.toGrouping(text.filter((s) => !!s).join(' ')),
    };
  }
}

export default TableQuerier;
