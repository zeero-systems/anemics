import {
  AnnotationException,
  AnnotationInterface,
  ArtifactType,
  Common,
  Component,
  Consumer,
  DecorationType,
  Decorator,
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
      if (!Metadata.getProperty(artifact.target, Common.singleton)) {
        artifact.target = new Proxy(artifact.target, {
          construct(currentTarget, currentArgs, newTarget) {
            if (currentTarget.prototype !== newTarget.prototype) {
              return Reflect.construct(currentTarget, currentArgs, newTarget);
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

            return Reflect.construct(currentTarget, currentArgs, newTarget);
          },
        });

        artifact.target.toString = Function.prototype.toString.bind(artifact.target);
      }

      return Mixin([Consumer(), Provider(), Component(decoration.parameters), Singleton()])(artifact.target, decoration.context);
    }

    throw new AnnotationException('Method not implemented for {name} on {kind}.', {
      key: 'NOT_IMPLEMENTED',
      context: { name: artifact.name, kind: decoration.kind },
    });
  }
}

export default (parameters?: ModuleParametersType): DecoratorFunctionType => Decorator.apply(Module, parameters);
