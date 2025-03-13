import HttpStatusEnum from './enums/HttpStatusEnums.ts';
import { RequesterInterface, ResponserInterface } from '~/server/interfaces.ts';

export type MethodType = 'GET' | 'POST' | 'PATCH' | 'PUT' | 'DELETE' | 'OPTIONS'

export type BodyType = BodyInit | undefined | null

export type BodyInitType = {
  headers?: Headers
  status?: HttpStatusEnum | undefined
  statusText?: string | undefined
}

export type NextType = () => Promise<void>

export type ContextType = { 
  requester: RequesterInterface
  responser: ResponserInterface
  metadata: Record<string | symbol, any>
}