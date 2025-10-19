import type { MiddlewareInterface } from '~/controller/interfaces.ts';

export const isMiddleware = (x: any): x is MiddlewareInterface => {
  return !!x && !!x.events && ['after', 'middle', 'before'].some((event) => x.events.includes(event))
};

export default isMiddleware;
