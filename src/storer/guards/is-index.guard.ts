import { IndexInterface } from '~/storer/interfaces.ts';

export const isIndex = (x: any): x is IndexInterface => {
  return !!x && x.name == 'Index'
};

export default isIndex;
