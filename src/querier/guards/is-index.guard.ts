import { IndexInterface } from '~/querier/interfaces.ts';
import Index from '~/querier/services/index.service.ts';

export const isIndex = (x: any): x is IndexInterface => {
  return x instanceof Index
}

export default isIndex