import { JoinInterface } from '~/querier/interfaces.ts';
import Join from '~/querier/services/clauses/join.service.ts';

export const isJoin = (x: any): x is JoinInterface<any> => {
  return x instanceof Join
}

export default isJoin