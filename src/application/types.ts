import HttpStatusEnum from '~/application/enums/http-status.annotation.ts';
import { RequesterInterface, ResponserInterface } from '~/application/interfaces.ts';

export type MethodType = 'GET' | 'POST' | 'PATCH' | 'PUT' | 'DELETE' | 'OPTIONS'

export type BodyType = BodyInit | undefined | null

export type BodyInitType = {
  headers?: Headers
  status?: HttpStatusEnum | undefined
  statusText?: string | undefined
}

export type NextType = () => Promise<void>

export type ContextType<T> = { 
  requester: RequesterInterface
  responser: ResponserInterface
  extra: T | undefined
}

export default {}