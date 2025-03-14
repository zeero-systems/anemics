import { EndpointType } from '~/controller/types.ts';
import { MethodType } from '~/server/types.ts';

export class Gateway {
  public static readonly module: unique symbol = Symbol('ROUTER')

  public static endpoints: Map<MethodType, Array<EndpointType>> = new Map([
    ['DELETE', []],
    ['GET', []],
    ['OPTIONS', []],
    ['PATCH', []],
    ['POST', []],
    ['PUT', []],
  ]);

  public static add(methodType: MethodType, target: EndpointType): void {    
    Gateway.endpoints.get(methodType)?.push(target)
  }
}

export default Gateway