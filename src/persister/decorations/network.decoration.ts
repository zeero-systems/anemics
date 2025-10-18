import { DecorationFunctionType, Decorator } from '@zeero/commons';

import NetworkAnnotation from '~/persister/annotations/network.annotation.ts'

export const Network: DecorationFunctionType<typeof NetworkAnnotation> = Decorator.create(NetworkAnnotation)

export default Network
