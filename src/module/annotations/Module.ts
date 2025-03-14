import {
  AnnotationException,
  AnnotationInterface,
  Annotations,
  ArtifactType,
  Consumer,
  DecorationType,
  Decorator,
  DecoratorContextType,
  DecoratorFunctionType,
  DecoratorKindEnum,
  Factory,
  Metadata,
  Mixin,
  Provider,
  Singleton,
  Text,
} from '@zxxxro/commons';
import { ModuleParametersType } from '~/module/types.ts';
import Interceptor from '~/controller/services/Interceptor.ts';

export class Module implements AnnotationInterface {
  onAttach<P>(artifact: ArtifactType, decoration: DecorationType<P & ModuleParametersType>): any {
    
    if (decoration.kind == DecoratorKindEnum.CLASS) {
      if (!Decorator.hasAnnotation(artifact.target, Annotations.Singleton)) {
       
        if (decoration?.parameters?.providers) {
          for (let index = 0; index < decoration.parameters.providers.length; index++) {
            const providerTarget = decoration.parameters.providers[index]
            const providerContext = {
              kind: DecoratorKindEnum.CLASS,
              name: Text.toFirstLetterUppercase(providerTarget.name || providerTarget.constructor.name),
              metadata: Metadata.getProperty(providerTarget, Decorator.metadata),
            } as DecoratorContextType

            Mixin([Provider(), Singleton()])(providerTarget, providerContext);
          }
        }

        if (decoration?.parameters?.consumers) {
          for (let index = 0; index < decoration.parameters.consumers.length; index++) {
            const consumerTarget = decoration.parameters.consumers[index]
            const consumerContext = {
              kind: DecoratorKindEnum.CLASS,
              name: Text.toFirstLetterUppercase(consumerTarget.name || consumerTarget.constructor.name),
              metadata: Metadata.getProperty(consumerTarget, Decorator.metadata),
            } as DecoratorContextType

            Mixin([Consumer()])(consumerTarget, consumerContext);
          }
        }

        if (decoration?.parameters?.middlewares) {
          for (let index = 0; index < decoration.parameters.middlewares.length; index++) {
            const middlewareTarget = decoration.parameters.middlewares[index];
            const middlewareName = Text.toFirstLetterUppercase(middlewareTarget.name || middlewareTarget.constructor.name)
            
            const middleware = Factory.construct(middlewareTarget)

            if (!middleware.event) {
              throw new AnnotationException(`The {name} do not have a middleware annotation.`, {
                key: 'NOT_IMPLEMENTED',
                context: { name: middlewareName, kind: decoration.kind },
              });
            }

            if(!Interceptor.exists(middlewareName, middleware.event)) {
              Interceptor.add(middleware, { action: middleware.action, event: middleware.event })
            }
          }
        }
        
        artifact.target.toString = Function.prototype.toString.bind(artifact.target);
      }
      
      return Mixin([Consumer(), Provider(), Singleton()])(artifact.target, decoration.context);
    }

    throw new AnnotationException('Method not implemented for {name} on {kind}.', {
      key: 'NOT_IMPLEMENTED',
      context: { name: artifact.name, kind: decoration.kind },
    });
  }
}

export default (parameters?: ModuleParametersType): DecoratorFunctionType => Decorator.apply(Module, parameters);
