import { BuilderInterface } from '~/querier/interfaces.ts';

export const isBuilder = (x: any): x is BuilderInterface<any> => {
  return !!x && !!x.toQuery
}

export default isBuilder