import { DecorationFunctionType, Decorator } from '@zeero/commons';

import SocketAnnotation from '~/controller/annotations/put.annotation.ts';

export const Socket: DecorationFunctionType<typeof SocketAnnotation> = Decorator.create(SocketAnnotation);

export default Socket;
