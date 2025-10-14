import type {
ActionInterface,
  ClauseInterface,
  ColumnInterface,
  CommonInterface,
  ConstraintInterface,
  ExistsInterface,
  NameInterface,
  RawInterface,
  RawwerInterface,
  TableInterface,
} from '~/querier/interfaces.ts';
import type { QuerierOptionsType } from '~/querier/types.ts';

import Name from '~/querier/services/clauses/name.service.ts';
import Column from '~/querier/services/clauses/column.service.ts';
import Rawwer from '~/querier/services/clauses/rawwer.service.ts';

import assign from '~/querier/functions/assign.function.ts';
import Exists from '~/querier/services/clauses/exists.service.ts';
import Constraint from './clauses/constraint.service.ts';
import Action from './clauses/action.service.ts';

export class Table implements TableInterface {
  [key: string]: any;
  
  public create: NameInterface<TableInterface> = new Name(this);
  public drop: NameInterface<TableInterface> = new Name(this);
  public raw: RawwerInterface<TableInterface> = new Rawwer(this);
  protected existsTable: ExistsInterface<TableInterface> = new Exists(this);
  protected actionTable: ActionInterface<TableInterface, 'cascade' | 'restrict'> = new Action(this)
  
  public clauses: Array<ClauseInterface> = [];

  constructor(public options: QuerierOptionsType = { args: [], text: '', placeholderType: 'counter' }) {
    this.create = assign(this.create, this);
    this.existsTable = assign(this.existsTable, this)
    this.drop = assign(this.drop, this);
    this.raw = assign(this.raw, this);
  }

  public get column(): ColumnInterface<TableInterface> {
    const clause = new Column(this) 
    const table = new Table(this.options)
    table.create = this.create
    table.drop = this.drop
    table.clauses = this.clauses
    this.clauses.push(assign(clause, table));
    return clause
  }

  public get constraint(): ConstraintInterface<TableInterface> {
    const clause = new Constraint(this) 
    const table = new Table(this.options)
    table.create = this.create
    table.drop = this.drop
    table.clauses = this.clauses
    this.clauses.push(assign(clause, table));
    return clause
  }

  ifExists(raw: RawInterface<TableInterface>): TableInterface;
  ifExists(value: any = true): TableInterface {
    this.existsTable.exists(value)
    return this
  }

  ifNotExists(raw: RawInterface<TableInterface>): TableInterface;
  ifNotExists(value: any = false): TableInterface {
    this.existsTable.exists(value)
    return this
  }

  cascade(): TableInterface {
    this.actionTable.action('cascade')
    return this
  }

  restrict(): TableInterface {
    this.actionTable.action('restrict')
    return this
  }

  public instantiate(): CommonInterface {
    return new Table({ args: [], text: '', placeholderType: 'counter' });
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
      'toColumnQuery',
      'toConstraintQuery',
      'toExistsQuery',
      'toActionQuery',
      'toRawQuery',
    ];

    let name = ''
    let exists = ''
    let action = ''
    let indexType = ''
    const columns = []

    if (this.create.nameText) indexType = 'CREATE'
    if (this.drop.nameText) indexType = 'DROP'

    for (const clause of this.clauses) {
      const key = queries.find((key) => clause[key]) || '';
  
      if (clause[key]) {
        const text = clause[key] ? clause[key](options).text : '';
        if (key == 'toNameQuery') {
          name = text
        } else if (key == 'toExistsQuery') {
          exists = text
        } else if (key == 'toActionQuery') {
          action = text
        } else {
          columns.push(text)
        }
      }
    }

    return {
      ...options,
      text: [
        indexType,
        'TABLE',
        exists,
        name,
        columns.length > 0 ? `(${columns.filter((s) => !!s).join(', ')})` : '',
        action,
      ].filter((s) => !!s).join(' ')
    };
  };
}

export default Table;
