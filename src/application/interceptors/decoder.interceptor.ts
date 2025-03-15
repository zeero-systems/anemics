import type { ContextType, NextType } from '~/application/types.ts';
import type { InterceptorInterface } from '~/controller/interfaces.ts';
import type { EndpointType } from '~/controller/types.ts';

import { Container, Text } from '@zxxxro/commons';

import Middleware from '~/controller/annotations/middleware.annotation.ts';

@Middleware('before', 'ordered')
export class DecoderInterceptor implements InterceptorInterface {
  async onUse<T>(context: ContextType<T & EndpointType>, next: NextType): Promise<void> {
    
    if (context.extra) {
      context.responser.addMetadata('parameters', [])

      const url = new URL(context.requester.url)

      for (let index = 0; index < context.extra.handler.parameterNames.length; index++) {
        const parameterName = Text.toFirstLetterUppercase(context.extra.handler.parameterNames[index]);

        context.responser.metadata.parameters[index] = undefined;

        if (parameterName == 'Context') {
          context.responser.metadata.parameters[index] = context
        }

        if (parameterName == 'Requester') {
          context.responser.metadata.parameters[index] = context.requester
          continue;
        }

        if (parameterName == 'Responser') {
          context.responser.metadata.parameters[index] = context.responser
          continue;
        }

        if (parameterName == 'Query') {
          context.responser.metadata.parameters[index] = url.searchParams
          continue;
        }

        if (parameterName == 'Path') {
          context.responser.metadata.parameters[index] = context.extra.handler.path.split('/').reduce((accum, curr: string, index: number) => {
            if (/:[A-Za-z1-9]{1,}/.test(curr)) {
              return { ...accum, [curr.replace(':', '')]: url.pathname.split('/')[index] };
            }
            return accum;
          }, {})
          continue;
        }

        if (parameterName == 'FormData') {
          context.responser.metadata.parameters[index] = await context.requester.request.formData()
        }
        
        if (Container.exists(parameterName)) {
          const body = context.requester.bodyUsed ? await context.requester.json() : undefined;
          const search = Object.fromEntries(url.searchParams);
          const model = Container.construct(parameterName, { arguments: body || search })

          context.responser.metadata.model = model
          context.responser.metadata.parameters[index] = model
        }
      }
    }

    return next()
  }
}

export default DecoderInterceptor;
