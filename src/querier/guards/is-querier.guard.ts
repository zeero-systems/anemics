
import { QuerierInterface } from '~/querier/interfaces.ts';

export const isQuerier = (x: any): x is QuerierInterface => {
  return !!x && x.select && x.from
}

export default isQuerier