import { FromInterface } from '~/querier/interfaces.ts';
import From from '~/querier/services/clauses/from.service.ts';

export const isFrom = (x: any): x is FromInterface<any> => {
  return x instanceof From
}

export default isFrom