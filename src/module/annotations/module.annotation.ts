import {
  Annotations,
  AnnotationException,
  AnnotationInterface,
  Artifactor,
  ArtifactType,
  Consumer,
  DecorationType,
  Decorator,
  DecoratorFunctionType,
  DecoratorKindEnum,
  Guards,
  Mixin,
  Scoper,
  Provider,
  Text,
  TagType,
} from '@zxxxro/commons';

import { ModuleParametersType, ModuleParameterType } from '~/module/types.ts';

import isArtifact from '~/module/guards/isArtifact.ts';

import { Controller } from "~/controller/annotations/controller.annotation.ts"
import Interceptor from "~/controller/services/interceptor.service.ts"

export class Module implements AnnotationInterface {
  static readonly tag: unique symbol = Symbol('Module.tag')

  onAttach<P>(artifact: ArtifactType, decoration: DecorationType<P & ModuleParametersType>): any {
    if (decoration.kind == DecoratorKindEnum.CLASS) {
      
      if (!Decorator.hasAnnotation(artifact.target, Module)) {
        if (decoration.parameters?.consumers) {
          Module.applyArtifacts(decoration.parameters.consumers, [Annotations.Consumer.tag])
        }
        if (decoration.parameters?.providers) {
          Module.applyArtifacts(decoration.parameters.providers, [Annotations.Provider.tag])
        }
        if (decoration.parameters?.controllers) {
          Module.applyArtifacts(decoration.parameters.controllers, [Controller.tag])
        }
        if (decoration.parameters?.interceptors) {
          Module.applyArtifacts(decoration.parameters.interceptors, [Interceptor.tag])
        }
        if (decoration.parameters?.modules) {
          Module.applyArtifacts(decoration.parameters.modules, [Module.tag])
        }
      }

      return Mixin([Consumer(), Provider()])(artifact.target, decoration.context);
    }

    throw new AnnotationException('Method not implemented for {name} on {kind}.', {
      key: 'NOT_IMPLEMENTED',
      context: { name: artifact.name, kind: decoration.kind },
    });
  }

  private static applyArtifacts(artifacts: Array<ModuleParameterType<any>>, tags: Array<TagType>) {
    for (let index = 0; index < artifacts.length; index++) {
      const artifact = artifacts[index]

      
      if (Guards.isClass(artifact)) {
        const artifactName = Text.toFirstLetterUppercase(artifact.name || artifact.constructor.name);
        
        if (!Artifactor.has(artifactName)) {
          Artifactor.set(artifactName, { 
            name: artifactName,
            target: artifact,
            tags
          })
        }
      }

      if (isArtifact(artifact)) {
        const artifactName = Text.toFirstLetterUppercase(artifact.name);
      
        Artifactor.set(artifactName, { 
          name: artifactName,
          target: artifact.target,
          tags
        })

        if (Guards.isClass(artifact.target)) {
          Scoper.applyMetadata(artifact.target)

          if (artifact.scope) {
            Scoper.setMetadata(artifact.scope, artifact.target)
          }
        }
      }
    }
  }
}

export default (parameters?: ModuleParametersType): DecoratorFunctionType => Decorator.apply(Module, parameters);
