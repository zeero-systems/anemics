import { DecorationFunctionType, Decorator } from '@zeero/commons';

import StructureAnnotation from '~/persister/annotations/structure.annotation.ts';

export const Structure: DecorationFunctionType<typeof StructureAnnotation> = Decorator.create(StructureAnnotation);

export default Structure;
