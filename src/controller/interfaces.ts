import type { ActionType, EndpointType, EventType } from '~/controller/types.ts';
import type { ContextType, NextType } from '~/server/types.ts'

export interface MiddlewareInterface {
  event?: EventType
  action?: ActionType
  weight?: number

  onRequest(endpoint: EndpointType | undefined, context: ContextType, next: NextType): Promise<void>
}