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
  Metadata,
  Mixin,
  Provider,
  Singleton,
  Text,
} from '@zxxxro/commons';
import { ModuleParametersType } from '~/module/types.ts';
import Middleware from '~/controller/annotations/Middleware.ts';

export class Module implements AnnotationInterface {
  onAttach<P>(artifact: ArtifactType, decoration: DecorationType<P & ModuleParametersType>): any {
    let target = artifact.target as any;

    if (decoration.kind == DecoratorKindEnum.CLASS) {
      if (!Metadata.getProperty(target, Common.singleton)) {
        target = new Proxy(target, {
          construct(currentTarget, currentArgs, newTarget) {
            if (currentTarget.prototype !== newTarget.prototype) {
              return Reflect.construct(currentTarget, currentArgs, newTarget);
            }

            if (decoration?.parameters?.middlewares) {
              for (let index = 0; index < decoration.parameters.middlewares.length; index++) {
                const middlewareTarget = decoration.parameters.middlewares[index];
                const middlewareDecorator = {
                  target: middlewareTarget,
                  context: {
                    kind: DecoratorKindEnum.CLASS,
                    name: Text.toFirstLetterUppercase(middlewareTarget.name || middlewareTarget.constructor.name),
                    metadata: Metadata.get(middlewareTarget),
                  },
                } as any;

                Mixin([Consumer(), Middleware(), Singleton()])(middlewareDecorator.target, middlewareDecorator.context);
              }
            }

            return Reflect.construct(currentTarget, currentArgs, newTarget);
          },
        });

        target.toString = Function.prototype.toString.bind(artifact.target);
      }

      return Mixin([Consumer(), Provider(), Component(decoration.parameters), Singleton()])(target, decoration.context);
    }

    throw new AnnotationException('Method not implemented for {name} on {kind}.', {
      key: 'NOT_IMPLEMENTED',
      context: { name: artifact.name, kind: decoration.kind },
    });
  }
}

export default (parameters?: ModuleParametersType): DecoratorFunctionType => Decorator.apply(Module, parameters);
