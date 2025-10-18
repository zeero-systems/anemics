import { DecorationFunctionType, Decorator } from '@zeero/commons';

import RelationAnnotation from '~/persister/annotations/relation.annotation.ts'

export const Relation: DecorationFunctionType<typeof RelationAnnotation> = Decorator.create(RelationAnnotation)

export default Relation
