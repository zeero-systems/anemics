import { DecorationFunctionType, Decorator } from '@zeero/commons';

import PutAnnotation from '~/controller/annotations/put.annotation.ts';

export const Put: DecorationFunctionType<typeof PutAnnotation> = Decorator.create(PutAnnotation);

export default Put;
