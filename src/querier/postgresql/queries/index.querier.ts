import type { BuilderOptionsType, ClauseType, QueryType } from '~/querier/types.ts';
import type {
  IndexQuerierInterface,
  IndexTypeClauseInterface,
  NameClauseInterface,
  RawClauseInterface,
  SelectClauseInterface,
  TableClauseInterface,
} from '~/querier/interfaces.ts';

import IndexType from '~/querier/postgresql/clauses/index-type.clause.ts';
import Name from '~/querier/postgresql/clauses/name.clause.ts';
import Raw from '~/querier/services/raw.clause.ts';
import Select from '~/querier/postgresql/clauses/select.clause.ts';
import Table from '~/querier/postgresql/clauses/table.clause.ts';
import Builder from '~/querier/services/builder.services.ts';

export class IndexQuerier implements IndexQuerierInterface {
  public clauses: Array<{ previous?: ClauseType; current: ClauseType }> = [];

  constructor(public options: BuilderOptionsType = { args: [], text: '' }) { }

  public use(options: BuilderOptionsType): IndexQuerierInterface {
    this.options = options;
    return this;
  }

  public instantiate(): IndexQuerierInterface {
    return new IndexQuerier();
  }

  public get create(): NameClauseInterface<IndexQuerierInterface> {
    return this.queue({ name: 'Name', target: new Name<IndexQuerierInterface>(this, 'CREATE INDEX') });
  }

  public get on(): TableClauseInterface<IndexQuerierInterface> {
    return this.queue({ name: 'From', target: new Table<IndexQuerierInterface>(this, 'ON') });
  }

  public get using(): IndexTypeClauseInterface<IndexQuerierInterface> {
    return this.queue({ name: 'Using', target: new IndexType<IndexQuerierInterface>(this, 'USING') });
  }

  public get with(): SelectClauseInterface<IndexQuerierInterface> {
    return this.queue({ name: 'With', target: new Select<IndexQuerierInterface>(this, '') });
  }

  public get raw(): RawClauseInterface<IndexQuerierInterface> {
    return this.queue({ name: 'Raw', target: new Raw<IndexQuerierInterface>('', this) });
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
    const ordered =  Builder.sorter(this.clauses, ['Name', 'From', 'Using', 'With']);

    const opts = { ...this.options, ...options }

    if (ordered.length > 0) {
      text.push(
        ...ordered.map((clause) => {
          let result = clause.target.query(opts).text;
          if (clause.name == 'With') {
            result = `(${result})`
          }
          return result
        }),
      );
    }

    return {
      ...opts,
      args: opts.args,
      text: this.toGrouping(text.filter((s) => !!s).join(' ')),
    };
  }
}

export default IndexQuerier;
