import { DecorationFunctionType, Decorator } from '@zeero/commons';

import HeadAnnotation from '~/controller/annotations/head.annotation.ts'

export const Head: DecorationFunctionType<typeof HeadAnnotation> = Decorator.create(HeadAnnotation)

export default Head
