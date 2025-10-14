import type {
  ClauseInterface,
  IndexInterface,
  NameInterface,
  OnInterface,
  CommonInterface,
  RawwerInterface,
  SelectInterface,
  TypeInterface,
} from '~/querier/interfaces.ts';
import type { QuerierOptionsType } from '~/querier/types.ts';

import Select from '~/querier/services/clauses/select.service.ts';
import On from '~/querier/services/clauses/on.service.ts';
import Name from '~/querier/services/clauses/name.service.ts';
import Rawwer from '~/querier/services/clauses/rawwer.service.ts';
import Type from '~/querier/services/clauses/type.service.ts';

import assign from '~/querier/functions/assign.function.ts';

export class Index implements IndexInterface {
  [key: string]: any;

  public create: NameInterface<IndexInterface> = new Name(this);
  public update: NameInterface<IndexInterface> = new Name(this);

  public on: OnInterface<IndexInterface> = new On(this);
  public using: TypeInterface<IndexInterface> = new Type(this, 'USING');
  public with: SelectInterface<IndexInterface> = new Select(this, '');
  public raw: RawwerInterface<IndexInterface> = new Rawwer(this);
  public indexType: string = '';

  protected isUnique: boolean;

  public clauses: Array<ClauseInterface> = [];

  constructor(public options: QuerierOptionsType = { args: [], text: '', placeholderType: 'counter' }) {
    this.isUnique = false;

    this.create = assign(this.create, this);
    this.update = assign(this.update, this);
    this.on = assign(this.on, this);
    this.using = assign(this.using, this);
    this.with = assign(this.with, this);
    this.raw = assign(this.raw, this);
  }

  unique(): this {
    this.isUnique = true;
    return this;
  }

  public instantiate(): CommonInterface {
    return new Index({ args: [], text: '', placeholderType: 'counter' });
  }

  public queue(clause: ClauseInterface): ClauseInterface {
    if (
      this.clauses.length == 0 ||
      this.clauses[this.clauses.length - 1] != clause
    ) {
      this.clauses.push(clause);
    }
    return clause;
  }

  public toQuery = (
    options: QuerierOptionsType = { args: [], text: '', placeholderType: 'counter' },
  ): QuerierOptionsType => {
    options = { ...options, ...this.options };

    const queries = [
      'toNameQuery',
      'toOnQuery',
      'toTypeQuery',
      'toSelectQuery',
      'toRawQuery',
    ];

    const indexType = this.create.hasName() ? 'CREATE' : 'UPDATE';

    return {
      ...options,
      text: [
        indexType,
        this.isUnique ? 'UNIQUE' : '',
        'INDEX',
        ...this.clauses.map((clause: ClauseInterface) => {
          const key = queries.find((key) => clause[key]) || '';

          if (clause[key]) {
            let text = clause[key] ? clause[key](options).text : '';
            if (key == 'toSelectQuery') {
              text = `(${text})`;
            }

            return text;
          }

          return '';
        }),
      ].filter((s) => !!s).join(' ')
    };
  };
}

export default Index;
