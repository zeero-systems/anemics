import { DecorationFunctionType, Decorator } from '@zeero/commons';

import ForeignKeyAnnotation from '~/storer/annotations/foreign-key.annotation.ts'

export const ForeignKey: DecorationFunctionType<typeof ForeignKeyAnnotation> = Decorator.create(ForeignKeyAnnotation)

export default ForeignKey
