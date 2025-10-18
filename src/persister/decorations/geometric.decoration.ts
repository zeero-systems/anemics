import { DecorationFunctionType, Decorator } from '@zeero/commons';

import GeometricAnnotation from '~/persister/annotations/geometric.annotation.ts'

export const Geometric: DecorationFunctionType<typeof GeometricAnnotation> = Decorator.create(GeometricAnnotation)

export default Geometric
