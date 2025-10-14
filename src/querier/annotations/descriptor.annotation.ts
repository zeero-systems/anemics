import type { AnnotationInterface, ArtifactType, DecoratorType } from '@zeero/commons';
import type { DescriptorOptionsType } from '~/querier/types.ts';

import { AnnotationException, DecoratorKindEnum } from '@zeero/commons';

export class DescriptorAnnotation implements AnnotationInterface {
  name: string = 'Descriptor'
  constructor(public options: DescriptorOptionsType) {}

  onAttach(artifact: ArtifactType, decorator: DecoratorType): any {
    if (decorator.decoration.kind == DecoratorKindEnum.CLASS) {
      const properties = this.options.properties
      const predicate = this.options.predicate || ((n: string): boolean => n[0] === '_')

      artifact.target = new Proxy(artifact.target as any, {
        construct(currentTarget, currentArgs, newTarget) {
          if (currentTarget.prototype !== newTarget.prototype) {
            return Reflect.construct(currentTarget, currentArgs, newTarget);
          }

          const target = Reflect.construct(currentTarget, currentArgs, newTarget);
          
          const propertyNames = Object.getOwnPropertyNames(target);
          for (const name of propertyNames) {
            if (predicate(name)) {
              Object.defineProperty(target, name, properties);
            }
          }

          return target
        },
      });
      
      return artifact.target
    }
    
    throw new AnnotationException('Method not implemented for {name} on {kind}.', {
      key: 'NOT_IMPLEMENTED',
      context: { name: artifact.name, kind: decorator.decoration.kind },
    });
  }

  onInitialize(_artifact: ArtifactType, _decorator: DecoratorType) { }
}

export default DescriptorAnnotation
