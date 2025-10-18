import type { RawClauseInterface } from '~/querier/interfaces.ts';

export const isRaw = (x: any): x is RawClauseInterface<any> => {
  return !!x && x.text
}

export default isRaw