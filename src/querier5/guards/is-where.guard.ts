import { WhereInterface } from '~/querier/interfaces.ts';
import Where from '~/querier/services/clauses/where.service.ts';

export const isWhere = (x: any): x is WhereInterface<any> => {
  return x instanceof Where
}

export default isWhere