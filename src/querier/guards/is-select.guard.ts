import { SelectInterface } from '~/querier/interfaces.ts';
import Select from '~/querier/adapters/sql/select.service.ts';

export const isSelect = (x: any): x is SelectInterface => {
  return x instanceof Select
}

export default isSelect