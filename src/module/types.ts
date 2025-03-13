import type { ComponentParametersType, ConstructorType } from '@zxxxro/commons';
import type { MiddlewareInterface } from '~/interceptor/interfaces.ts';

export type ModuleParametersType = ComponentParametersType & {
  middlewares?: Array<ConstructorType<MiddlewareInterface>>
}