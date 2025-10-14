import { DecorationFunctionType, Decorator } from '@zeero/commons';

import PatchAnnotation from '~/controller/annotations/patch.annotation.ts'

export const Patch: DecorationFunctionType<typeof PatchAnnotation> = Decorator.create(PatchAnnotation)

export default Patch
