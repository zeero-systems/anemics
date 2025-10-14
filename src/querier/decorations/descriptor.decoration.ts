import { DecorationFunctionType, Decorator } from '@zeero/commons';

import DescriptorAnnotation from '~/querier/annotations/descriptor.annotation.ts'

export const Descriptor: DecorationFunctionType<typeof DescriptorAnnotation> = Decorator.create(DescriptorAnnotation)

export default Descriptor
