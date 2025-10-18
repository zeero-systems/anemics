import { DecorationFunctionType, Decorator } from '@zeero/commons';

import IndexAnnotation from '~/persister/annotations/index.annotation.ts'

export const Index: DecorationFunctionType<typeof IndexAnnotation> = Decorator.create(IndexAnnotation)

export default Index
