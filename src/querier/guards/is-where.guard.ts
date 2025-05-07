import { WhereInterface } from '~/querier/interfaces.ts';
import Where from '~/querier/adapters/sql/where.service.ts';

export const isWhere = (x: any): x is WhereInterface => {
  return x instanceof Where
}

export default isWhere