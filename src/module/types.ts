import type { ComponentParametersType, ConstructorType } from '@zxxxro/commons';
import type { MiddlewareInterface } from '~/controller/interfaces.ts';

export type ModuleParametersType = ComponentParametersType & {
  middlewares?: Array<ConstructorType<MiddlewareInterface>>
}