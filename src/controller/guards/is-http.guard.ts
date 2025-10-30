import type { HttpAnnotationInterface } from '~/controller/interfaces.ts';

import ActionEnum from '~/network/enums/method.enum.ts';
import Router from '~/controller/services/router.service.ts';

export const isHttp = (x: any): x is HttpAnnotationInterface => {
  return !!x && x.name != ActionEnum.SOCKET && Router.actions.includes(x.name.toLowerCase());
};

export default isHttp;
