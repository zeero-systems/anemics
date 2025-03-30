import { ContextType, EndpointType, Intercept, InterceptorInterface } from '@zxxxro/anemics';
import { Container, Factory, Text } from '@zxxxro/commons';

@Intercept('then', 0)
export class RequestInterceptor implements InterceptorInterface {
  async onUse<T>(context: ContextType<T & EndpointType>): Promise<void> {
    
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
          context.responser.metadata.parameters[index] = context.extra.handler.path.split('/').filter(p => !!p).reduce((accum, curr: string, index: number) => {
            if (/:[A-Za-z1-9]{1,}/.test(curr)) {
              return { ...accum, [curr.replace(':', '')]: url.pathname.split('/').filter(p => !!p)[index] };
            }
            return accum;
          }, {})
          continue;
        }

        if (parameterName == 'FormData') {
          context.responser.metadata.parameters[index] = await context.requester.request.formData()
        }
        if (Container.artifacts.has(parameterName)) {
          let body;
          if (context.requester.bodyUsed) body = await context.requester.json() 
          if (context.requester.body) body = await context.requester.request.json()
            
          const search = Object.fromEntries(url.searchParams);
          const model = Factory.construct(Container.artifacts.get(parameterName)?.target, { arguments: { properties: body || search } })

          context.responser.metadata.model = model
          context.responser.metadata.parameters[index] = model
        }
      }
    }
  }
}

export default RequestInterceptor