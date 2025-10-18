import type { MiddlewareInterface } from '~/controller/interfaces.ts';

export const isMiddleware = (x: any): x is MiddlewareInterface => {
  return !!x && !!x.event && ['after', 'middle', 'before'].includes(x.event)
};

export default isMiddleware;
