import { JoinInterface } from '~/querier/interfaces.ts';
import Join from '~/querier/adapters/sql/join.service.ts';

export const isJoin = (x: any): x is JoinInterface => {
  return x instanceof Join
}

export default isJoin