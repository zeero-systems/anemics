
import { ConsumerObjectType } from '~/container/types.ts';

import isObject from '~/common/guards/isObject.ts';

export const isConsumerObject = (x: any): x is ConsumerObjectType => {
  return x && isObject(x)
};

export default isConsumerObject