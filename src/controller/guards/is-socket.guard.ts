import type { SocketAnnotationInterface } from '~/controller/interfaces.ts';

import ActionEnum from '~/network/enums/method.enum.ts';

export const isSocket = (x: any): x is SocketAnnotationInterface => {
  return !!x && x.name === ActionEnum.SOCKET
};

export default isSocket;
