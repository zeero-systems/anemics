import { DecorationFunctionType, Decorator } from '@zeero/commons';

import ManyAnnotation from '~/storer/annotations/many.annotation.ts'

export const Many: DecorationFunctionType<typeof ManyAnnotation> = Decorator.create(ManyAnnotation)

export default Many
