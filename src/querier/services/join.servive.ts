import { JoinInterface, QuerierInterface, QueryInterface, StatementInterface } from '~/querier/interfaces.ts';
import { BracketFunction, FirstTermType, JoinPredicateType, JoinStatementType, OperatorType, QueryArgType, QueryType, SecondTermType, SubQueryType } from '~/querier/types.ts';

import isBracket from '~/querier/guards/is-bracket.guard.ts';
import Querier from '~/querier/services/querier.services.ts';
import isQuerier from '~/querier/guards/is-querier.guard.ts';
import Statement from '~/querier/services/statement.service.ts';

export class Join implements JoinInterface {
  constructor(
    public query: QuerierInterface,
    public statement: Array<JoinStatementType> = [],
  ) {}

  on(): this & QueryInterface {
    const lastIndex = this.statement.length ? this.statement.length - 1 : 0
    this.statement[lastIndex].predicate = 'ON'

    return Object.assign(this, this.query)
  }
  using(): this & QueryInterface {
    const lastIndex = this.statement.length ? this.statement.length - 1 : 0
    this.statement[lastIndex].predicate = 'USING'

    return Object.assign(this, this.query)
  }
  where(): this & QueryInterface {
    const lastIndex = this.statement.length ? this.statement.length - 1 : 0
    this.statement[lastIndex].predicate = 'WHERE'

    return Object.assign(this, this.query)
  }

  or(bracket: BracketFunction<SubQueryType>): this & QuerierInterface;
  or(operator: OperatorType, bracket: BracketFunction<SubQueryType>): this & QuerierInterface;
  or(operator: OperatorType, secondTerm?: SecondTermType): this & QuerierInterface;
  or(firstTerm: FirstTermType, operator: OperatorType, bracket: BracketFunction<SubQueryType>): this & QuerierInterface;
  or(firstTerm: FirstTermType, operator: OperatorType, secondTerm?: SecondTermType): this & QuerierInterface;
  or(firstTerm: any, operator?: any, secondTerm?: any): this & QuerierInterface {
    const lastIndex = this.statement.length ? this.statement.length - 1 : 0
    this.statement[lastIndex].statements.and(firstTerm, operator, secondTerm)

    return Object.assign(this, this.query)
  }
  
  and(bracket: BracketFunction<SubQueryType>): this & QuerierInterface;
  and(operator: OperatorType, bracket: BracketFunction<SubQueryType>): this & QuerierInterface;
  and(operator: OperatorType, secondTerm?: SecondTermType): this & QuerierInterface;
  and(firstTerm: FirstTermType, operator: OperatorType, bracket: BracketFunction<SubQueryType>): this & QuerierInterface;
  and(firstTerm: FirstTermType, operator: OperatorType, secondTerm?: SecondTermType): this & QuerierInterface;
  and(firstTerm: any, operator?: any, secondTerm?: any): this & QuerierInterface {
    const lastIndex = this.statement.length ? this.statement.length - 1 : 0
    this.statement[lastIndex].statements.and(firstTerm, operator, secondTerm)

    return Object.assign(this, this.query);
  }

  inner(alias: string, bracket: BracketFunction<SubQueryType>): this & QuerierInterface;
  inner(name: string, alias?: string): this & QuerierInterface;
  inner(name: any, alias?: any): this & QuerierInterface {

    const join: JoinStatementType = {
      table: { name, alias },
      operator: 'INNER',
      predicate: 'ON',
      statements: new Statement(this.query)
    }

    if (isBracket(alias)) {
      const toAlias = join.table.name as string
      join.table.name = alias(new Querier())
      join.table.alias = toAlias
    }

    this.statement.push(join)

    return Object.assign(this, this.query)
  }


  toQuery(options: QueryArgType): QueryType {
    const text = [
      this.statement.map((statement) => {
        let text = '';

        if (isQuerier(statement.table.name)) {
          text = [
            `(${statement.table.name?.getQuery(options).text})`,
            `AS ${statement.table.alias}`,
          ].filter((s) => !!s).join(' ');
        }

        if (typeof statement.table.name == 'string') {
          text = [
            statement.table.name,
            statement.table.alias ? `AS ${statement.table.alias}` : undefined,
          ].filter((s) => !!s).join(' ');
        }

        text = `${statement.operator} JOIN ${text} ${statement.predicate} ${statement.statements.toQuery(options).text}`

        return text;
      }).join(' '),
    ].filter((s) => !!s).join('');


    return { text, ...options };
  }
}

export default Join;
