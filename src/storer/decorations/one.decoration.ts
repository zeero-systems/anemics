import { DecorationFunctionType, Decorator } from '@zeero/commons';

import OneAnnotation from '~/storer/annotations/one.annotation.ts'

export const One: DecorationFunctionType<typeof OneAnnotation> = Decorator.create(OneAnnotation)

export default One
