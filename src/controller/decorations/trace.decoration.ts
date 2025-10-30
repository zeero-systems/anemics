import { DecorationFunctionType, Decorator } from '@zeero/commons';

import TraceAnnotation from '~/controller/annotations/put.annotation.ts';

export const Trace: DecorationFunctionType<typeof TraceAnnotation> = Decorator.create(TraceAnnotation);

export default Trace;
