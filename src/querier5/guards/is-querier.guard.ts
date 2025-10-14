
import { CommonInterface } from '~/querier/interfaces.ts';

export const isQuerier = (x: any): x is CommonInterface => {
  return !!x && !!x.toQuery
}

export default isQuerier