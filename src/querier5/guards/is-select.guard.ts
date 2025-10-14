import { SelectInterface } from '~/querier/interfaces.ts';
import Select from '~/querier/services/clauses/select.service.ts';

export const isSelect = (x: any): x is SelectInterface<any> => {
  return x instanceof Select
}

export default isSelect