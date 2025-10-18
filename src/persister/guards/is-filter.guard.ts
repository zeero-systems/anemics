import { FilterType } from '~/persister/types.ts';

export const isFilter = (x: any): x is FilterType => {
  return !!x && (x === true || !!x.select || !!x.where || !!x.order || !!x.group)
}

export default isFilter