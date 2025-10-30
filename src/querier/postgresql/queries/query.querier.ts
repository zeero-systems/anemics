import type { BuilderOptionsType, ClauseType, QueryType } from '~/querier/types.ts';
import type {
  DeleteClauseInterface,
  InsertClauseInterface,
  JoinClauseInterface,
  LimitClauseInterface,
  OffsetClauseInterface,
  OrderClauseInterface,
  PredicateClauseInterface,
  QueryQuerierInterface,
  RawClauseInterface,
  SelectClauseInterface,
  TableClauseInterface,
  UpdateClauseInterface,
} from '~/querier/interfaces.ts';

import Delete from '~/querier/postgresql/clauses/delete.clause.ts';
import Insert from '~/querier/postgresql/clauses/insert.clause.ts';
import Join from '~/querier/postgresql/clauses/join.clause.ts';
import Order from '~/querier/postgresql/clauses/order.clause.ts';
import Predicate from '~/querier/postgresql/clauses/predicate.clause.ts';
import Raw from '~/querier/services/raw.clause.ts';
import Select from '~/querier/postgresql/clauses/select.clause.ts';
import Table from '~/querier/postgresql/clauses/table.clause.ts';
import Update from '~/querier/postgresql/clauses/update.clause.ts';
import Builder from '~/querier/services/builder.services.ts';
import Return from '~/querier/services/return.clause.ts';
import Limit from '~/querier/postgresql/clauses/limit.clause.ts';
import Offset from '~/querier/postgresql/clauses/offset.clause.ts';

export class QueryQuerier implements QueryQuerierInterface {
  public clauses: Array<{ previous?: ClauseType; current: ClauseType }> = [];

  constructor(public options: BuilderOptionsType = { args: [], text: '' }) {}

  public use(options: BuilderOptionsType): QueryQuerierInterface {
    this.options = options;
    return this;
  }

  public instantiate(): QueryQuerierInterface {
    return new QueryQuerier();
  }

  public get select(): SelectClauseInterface<QueryQuerierInterface> {
    return this.queue({ name: 'Select', target: new Select<QueryQuerierInterface>(this, 'SELECT') });
  }

  public get insert(): InsertClauseInterface<QueryQuerierInterface> {
    return this.queue({ name: 'Insert', target: new Insert<QueryQuerierInterface>(this, 'INSERT INTO') });
  }

  public get update(): UpdateClauseInterface<QueryQuerierInterface> {
    return this.queue({ name: 'Update', target: new Update<QueryQuerierInterface>(this, 'UPDATE') });
  }

  public get delete(): DeleteClauseInterface<QueryQuerierInterface> {
    return this.queue({ name: 'Delete', target: new Delete<QueryQuerierInterface>(this, 'DELETE') });
  }

  public get from(): TableClauseInterface<QueryQuerierInterface> {
    return this.queue({ name: 'From', target: new Table<QueryQuerierInterface>(this, 'FROM') });
  }

  public get where(): PredicateClauseInterface<QueryQuerierInterface> {
    return this.queue({ name: 'Where', target: new Predicate<QueryQuerierInterface>(this, 'WHERE') });
  }

  public get left(): JoinClauseInterface<QueryQuerierInterface> {
    return this.queue({ name: 'Join', target: new Join<QueryQuerierInterface>(this, 'LEFT JOIN') });
  }

  public get right(): JoinClauseInterface<QueryQuerierInterface> {
    return this.queue({ name: 'Join', target: new Join<QueryQuerierInterface>(this, 'RIGHT JOIN') });
  }

  public get inner(): JoinClauseInterface<QueryQuerierInterface> {
    return this.queue({ name: 'Join', target: new Join<QueryQuerierInterface>(this, 'INNER JOIN') });
  }

  public get cross(): JoinClauseInterface<QueryQuerierInterface> {
    return this.queue({ name: 'Join', target: new Join<QueryQuerierInterface>(this, 'CROSS JOIN') });
  }

  public get full(): JoinClauseInterface<QueryQuerierInterface> {
    return this.queue({ name: 'Join', target: new Join<QueryQuerierInterface>(this, 'FULL JOIN') });
  }

  public get order(): OrderClauseInterface<QueryQuerierInterface> {
    return this.queue({ name: 'OrderBy', target: new Order<QueryQuerierInterface>(this, 'ORDER BY') });
  }

  public get group(): SelectClauseInterface<QueryQuerierInterface> {
    return this.queue({ name: 'GroupBy', target: new Select<QueryQuerierInterface>(this, 'GROUP BY') });
  }

  public get limit(): LimitClauseInterface<QueryQuerierInterface> {
    return this.queue({ name: 'Limit', target: new Limit<QueryQuerierInterface>(this, 'LIMIT') });
  }

  public get offset(): OffsetClauseInterface<QueryQuerierInterface> {
    return this.queue({ name: 'Offset', target: new Offset<QueryQuerierInterface>(this, 'OFFSET') });
  }

  public get returns(): SelectClauseInterface<QueryQuerierInterface> {
    return this.queue({ name: 'Return', target: new Return<QueryQuerierInterface>(this, 'RETURNING') });
  }

  public get raw(): RawClauseInterface<QueryQuerierInterface> {
    return this.queue({ name: 'Raw', target: new Raw<QueryQuerierInterface>('', this) });
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
    const ordered = Builder.sorter(this.clauses, [
      'Select',
      'Insert',
      'Update',
      'Delete',
      'From',
      'Join',
      'Where',
      'GroupBy',
      'Having',
      'OrderBy',
      'Limit',
      'Offset',
      'Return',
    ]);

    const opts = { ...this.options, ...options };

    const returns: string[] = [];

    const printReturns = ordered.find((o) => ['Insert', 'Update', 'Delete'].includes(o.name));

    if (ordered.length > 0) {
      text.push(
        ...ordered.map((clause) => {
          if (!printReturns && clause.name == 'Return') {
            returns.push(...clause.target.columns.map((c: any) => c.name));
          }
          return clause.target.query(opts).text;
        }),
      );
    }

    return {
      ...opts,
      returns,
      text: this.toGrouping(text.filter((s) => !!s).join(' ')),
    };
  }
}

export default QueryQuerier;
