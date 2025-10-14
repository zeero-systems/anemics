import { FilterType } from '~/querier/types.ts';

export const isFilter = (x: any): x is FilterType => {
  return !!x && !!x.select || !!x.where || !!x.order || !!x.group
}

export default isFilter