
import { RawInterface } from '~/querier/interfaces.ts';

export const isRaw = (x: any): x is RawInterface => {
  return !!x && x.rawValue
}

export default isRaw