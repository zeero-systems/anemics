import { DecorationFunctionType, Decorator } from '@zeero/commons';

import MiddlewareAnnotation from '~/controller/annotations/middleware.annotation.ts';

export const Middleware: DecorationFunctionType<typeof MiddlewareAnnotation> = Decorator.create(MiddlewareAnnotation);

export default Middleware;
