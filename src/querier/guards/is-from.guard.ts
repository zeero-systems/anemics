import { FromInterface } from '~/querier/interfaces.ts';
import From from '~/querier/adapters/sql/from.service.ts';

export const isFrom = (x: any): x is FromInterface => {
  return x instanceof From
}

export default isFrom