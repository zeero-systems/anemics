import {
  AnnotationException,
  AnnotationInterface,
  Annotations,
  ArtifactType,
  Consumer,
  Container,
  DecorationType,
  Decorator,
  DecoratorContextType,
  DecoratorFunctionType,
  DecoratorKindEnum,
  Guards,
  Metadata,
  Mixin,
  Provider,
  Singleton,
  Text,
} from '@zxxxro/commons';
import { ModuleParametersType } from '~/module/types.ts';

import Middleware from '~/controller/annotations/middleware.annotation.ts';
import Controller from '~/controller/annotations/controller.annotation.ts';
import isProviderObject from '~/module/guards/isProviderObject.ts';

export class Module implements AnnotationInterface {
  onAttach<P>(artifact: ArtifactType, decoration: DecorationType<P & ModuleParametersType>): any {
    
    if (decoration.kind == DecoratorKindEnum.CLASS) {
      if (!Decorator.hasAnnotation(artifact.target, Annotations.Singleton)) {
       
        if (decoration?.parameters?.providers) {
          for (let index = 0; index < decoration.parameters.providers.length; index++) {
            const providerTarget = decoration.parameters.providers[index]
            
            if (Guards.isClass(providerTarget)) {
              const providerContext = {
                kind: DecoratorKindEnum.CLASS,
                name: Text.toFirstLetterUppercase(providerTarget.name || providerTarget.constructor.name),
                metadata: Metadata.getProperty(providerTarget, Decorator.metadata),
              } as DecoratorContextType

              Mixin([Provider(), Singleton()])(providerTarget, providerContext);
            }

            if (isProviderObject(providerTarget)) {
              Container.set(Text.toFirstLetterUppercase(providerTarget.name), providerTarget.value);
            }

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
            const middlewareTarget = decoration.parameters.middlewares[index]
            const middlewareContext = {
              kind: DecoratorKindEnum.CLASS,
              name: Text.toFirstLetterUppercase(middlewareTarget.name || middlewareTarget.constructor.name),
              metadata: Metadata.getProperty(middlewareTarget, Decorator.metadata),
            } as DecoratorContextType

            Mixin([Middleware()])(middlewareTarget, middlewareContext);
          }
        }

        if (decoration?.parameters?.controllers) {
          for (let index = 0; index < decoration.parameters.controllers.length; index++) {
            const controllerTarget = decoration.parameters.controllers[index]
            const controllerContext = {
              kind: DecoratorKindEnum.CLASS,
              name: Text.toFirstLetterUppercase(controllerTarget.name || controllerTarget.constructor.name),
              metadata: Metadata.getProperty(controllerTarget, Decorator.metadata),
            } as DecoratorContextType

            Mixin([Controller()])(controllerTarget, controllerContext);
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
