import { DecorationFunctionType, Decorator } from '@zeero/commons';

import DateAnnotation from '~/storer/annotations/date.annotation.ts'

export const Date: DecorationFunctionType<typeof DateAnnotation> = Decorator.create(DateAnnotation)

export default Date
