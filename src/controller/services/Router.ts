import { EndpointType } from '~/controller/types.ts';
import { MethodType } from '~/server/types.ts';

export class Router {
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
    Router.endpoints.get(methodType)?.push(target)
  }
}

export default Router