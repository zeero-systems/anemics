
import { RawInterface } from '~/querier/interfaces.ts';

export const isRaw = (x: any): x is RawInterface<any> => {
  return !!x && x.rawValue
}

export default isRaw