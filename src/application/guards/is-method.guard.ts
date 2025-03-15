import { MethodType } from '~/application/types.ts';

export const isMethod = (x: any): x is MethodType => {
  return ['GET', 'POST', 'PATCH', 'PUT', 'DELETE', 'OPTIONS'].includes(x)
};

export default isMethod;
