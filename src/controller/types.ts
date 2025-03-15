import { ConstructorType } from '@zxxxro/commons';
import { MethodType } from '~/bootstraper/types.ts';

export type ParameterType = ('request' | 'response' | 'query' | 'params' | 'formData') & string

export type ControllerType = {
  path: string
  target: ConstructorType<any>
}

export type HandlerType = {
  path: string
  method: MethodType
  pattern: URLPattern
  propertyKey: string
  parameterNames: Array<ParameterType>
  paremeterValues: Array<any>
}

export type EndpointType = {
  controller: ControllerType
  handler: HandlerType
}

export type EventType = 'then' | 'catch' | 'finally';

export type ActionType = 'first' | 'last';

export type OptionsType = {
  action: ActionType
  event: EventType
  weight: number
} & { [key: string | symbol]: any }

export default {}