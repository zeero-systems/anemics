import { DecorationFunctionType, Decorator } from '@zeero/commons';

import ForeignKeyAnnotation from '~/persister/annotations/foreign-key.annotation.ts'

export const ForeignKey: DecorationFunctionType<typeof ForeignKeyAnnotation> = Decorator.create(ForeignKeyAnnotation)

export default ForeignKey
