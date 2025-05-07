
import { QuerierInterface } from '~/querier/interfaces.ts';

export const isQuerier = (x: any): x is QuerierInterface => {
  return !!x && !!x.syntax
}

export default isQuerier