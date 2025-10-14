import type { BuilderOptionsType, ClauseType, QueryType } from '~/querier/types.ts';
import type { JoinClauseInterface, OrderClauseInterface, PredicateClauseInterface,QueryInterface, RawClauseInterface, SelectClauseInterface, TableClauseInterface } from '~/querier/interfaces.ts';

import Select from '~/querier/postgresql/clauses/select.clause.ts';
import Raw from '~/querier/adapters/postgres/raw.clause.ts';
import Predicate from '~/querier/adapters/postgres/predicate.clause.ts';
import Order from '~/querier/postgresql/clauses/order.clause.ts';
import Join from '~/querier/postgresql/clauses/join.clause.ts';
import Table from '~/querier/postgresql/clauses/table.clause.ts';

export class Query implements QueryInterface  {
  public options: BuilderOptionsType = {}
  public clauses: Array<{ previous?: ClauseType; current: ClauseType }> = [];

  constructor() {
  }

  public with(options: BuilderOptionsType): QueryInterface {
    this.options = options
    return this
  }

  public instantiate(): QueryInterface {
    return new Query()
  }

  public get select(): SelectClauseInterface<QueryInterface> {
    return this.queue({ name: 'Select', target: new Select<QueryInterface>(this, 'SELECT') });
  }

  public get from(): TableClauseInterface<QueryInterface> {
    return this.queue({ name: 'From', target: new Table<QueryInterface>(this, 'FROM') });
  }

  public get where(): PredicateClauseInterface<QueryInterface> {
    return this.queue({ name: 'Where', target: new Predicate<QueryInterface>(this, 'WHERE') });
  }

  public get left(): JoinClauseInterface<QueryInterface> {
    return this.queue({ name: 'Join', target: new Join<QueryInterface>(this, 'LEFT JOIN') });
  }

  public get right(): JoinClauseInterface<QueryInterface> {
    return this.queue({ name: 'Join', target: new Join<QueryInterface>(this, 'RIGHT JOIN') });
  }
  
  public get inner(): JoinClauseInterface<QueryInterface> {
    return this.queue({ name: 'Join', target: new Join<QueryInterface>(this, 'INNER JOIN') });
  }

  public get cross(): JoinClauseInterface<QueryInterface> {
    return this.queue({ name: 'Join', target: new Join<QueryInterface>(this, 'CROSS JOIN') });
  }

  public get full(): JoinClauseInterface<QueryInterface> {
    return this.queue({ name: 'Join', target: new Join<QueryInterface>(this, 'FULL JOIN') });
  }

  public get order(): OrderClauseInterface<QueryInterface> {
    return this.queue({ name: 'OrderBy', target: new Order<QueryInterface>(this, 'ORDER BY') });
  }

  public get raw(): RawClauseInterface<QueryInterface> {
    return this.queue({ name: 'Raw', target: new Raw<QueryInterface>(this) });
  }

  public queue(clause: ClauseType): any {
    if (this.clauses.length > 0 && clause.name == 'Raw') {
      this.clauses.push({ previous: this.clauses[this.clauses.length - 1].current, current: clause });
    } else {
      this.clauses.push({ current: clause });
    }
    return clause.target;
  }

  public sorter(clauses: Array<string>): any[] {
    const ordered: Array<ClauseType> = [];
    const wasOrdered = new Set<number>();

    if (
      this.clauses.length > 0 &&
      this.clauses[0].current.name === 'Raw'
    ) {
      ordered.push(this.clauses[0].current);
      wasOrdered.add(0);
    }

    for (const name of clauses) {
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

    return ordered;
  }

  private toGrouping(text: string): string {
    if (this.options.grouping) {
      if (this.options.grouping == 'brackets') return `[${text}]`
      if (this.options.grouping == 'braces') return `{${text}}`
      return `(${text})`
    }

    return text
  }

  public toQuery(options: QueryType): QueryType {
    const text: Array<string> = [];
    const ordered = this.sorter(['Select', 'From', 'Where', 'Join', 'GroupBy', 'Having', 'OrderBy']);

    console.log(Deno.inspect(ordered, { depth: 6 }))
    
    if (ordered.length > 0) {
      text.push(
        ordered.map((clause) => {
          return clause.target.query(options).text;
        }).join(' '),
      );
    }

    return {
      args: [],
      text: this.toGrouping(text.filter((s) => !!s).join(' ')),
    };
  }
}

export default Query
