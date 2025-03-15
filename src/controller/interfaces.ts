import type { ActionType, EndpointType, EventType } from '~/controller/types.ts';
import type { ContextType, NextType } from '~/application/types.ts'

export interface ControllerInterface {}

export interface InterceptorInterface {
  event?: EventType
  action?: ActionType
  weight?: number

  onUse<T>(context: ContextType<T>, next: NextType): Promise<void>
}

export default {}