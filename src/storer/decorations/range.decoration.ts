import { DecorationFunctionType, Decorator } from '@zeero/commons';

import RangeAnnotation from '~/storer/annotations/range.annotation.ts'

export const Range: DecorationFunctionType<typeof RangeAnnotation> = Decorator.create(RangeAnnotation)

export default Range
