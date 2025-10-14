import { DecorationFunctionType, Decorator } from '@zeero/commons';

import NumericAnnotation from '~/storer/annotations/numeric.annotation.ts'

export const Numeric: DecorationFunctionType<typeof NumericAnnotation> = Decorator.create(NumericAnnotation)

export default Numeric
