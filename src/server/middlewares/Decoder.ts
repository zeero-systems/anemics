import type { ContextType, NextType } from '~/server/types.ts';
import type { MiddlewareInterface } from '~/controller/interfaces.ts';
import type { EndpointType } from '~/controller/types.ts';

import { ConstructorType, Factory, Text } from '@zxxxro/commons';

import Model from '~/controller/services/Framer.ts';

export class Decoder implements MiddlewareInterface {
  static weigth: number = 0;
  async onRequest(endpoint: EndpointType | undefined, context: ContextType, next: NextType): Promise<void> {
    
    if (endpoint) {
      context.metadata.parameters = []

      const url = new URL(context.requester.url)

      for (let index = 0; index < endpoint.handler.parameterNames.length; index++) {
        const parameterName = Text.toFirstLetterUppercase(endpoint.handler.parameterNames[index]);

        context.metadata.parameters[index] = undefined;

        if (parameterName == 'Context') {
          context.metadata.parameters[index] = context
        }

        if (parameterName == 'Requester') {
          context.metadata.parameters[index] = context.requester
          continue;
        }

        if (parameterName == 'Responser') {
          context.metadata.parameters[index] = context.responser
          continue;
        }

        if (parameterName == 'Query') {
          context.metadata.parameters[index] = url.searchParams
          continue;
        }

        if (parameterName == 'Path') {
          context.metadata.parameters[index] = endpoint.handler.path.split('/').reduce((accum, curr: string, index: number) => {
            if (/:[A-Za-z1-9]{1,}/.test(curr)) {
              return { ...accum, [curr.replace(':', '')]: url.pathname.split('/')[index] };
            }
            return accum;
          }, {})
          continue;
        }

        if (parameterName == 'FormData') {
          context.metadata.parameters[index] = await context.requester.request.formData()
        }

        if (Model.models.has(parameterName)) {
          const ModelClass = Model.models.get(parameterName) as ConstructorType<any>
          const body = context.requester.bodyUsed ? await context.requester.json() : undefined;
          const search = Object.fromEntries(url.searchParams);
          const model = Factory.construct(ModelClass, { arguments: body || search })

          context.metadata.model = model
          context.metadata.parameters[index] = model
        }
      }
    }

    return next()
  }
}

export default Decoder;
