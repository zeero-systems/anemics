import type { AnnotationInterface, ArtifactType, DecoratorType } from '@zeero/commons';
import type { SchemaOptionsType } from '~/persister/types.ts';
import type {
  ColumnInterface,
  ForeignKeyInterface,
  IndexInterface,
  RelationInterface,
  SchemaInterface,
} from '~/persister/interfaces.ts';

import { AnnotationException, DecoratorKindEnum, DecoratorMetadata } from '@zeero/commons';

import isColumn from '~/persister/guards/is-column.guard.ts';
import isForeignKey from '~/persister/guards/is-foreign-key.guard.ts';
import isIndex from '~/persister/guards/is-index.guard.ts';
import isRelation from '~/persister/guards/is-relation.guard.ts';

export class SchemaAnnotation implements AnnotationInterface, SchemaInterface {
  name: string = 'Schema';
  persists?: boolean | undefined = true;
  stackable?: boolean | undefined = false;

  indexes: { key: string | symbol; annotation: IndexInterface & AnnotationInterface }[] = [];
  columns: { key: string | symbol; annotation: ColumnInterface & AnnotationInterface }[] = [];
  foreignKeys: { key: string | symbol; annotation: ForeignKeyInterface & AnnotationInterface }[] = [];
  relations: { key: string | symbol; annotation: RelationInterface & AnnotationInterface }[] = [];

  // @TODO optimize to cache build queries
  // Right now the repository on each static operation has to loop trought
  // this annotation to find all info to returns a QuerierOptionsType
  // The QuerierOptionsType can use placeholders to dynamic values

  constructor(public table: string, public options?: SchemaOptionsType) {}

  onAttach(artifact: ArtifactType, decorator: DecoratorType): any {
    if (decorator.decoration.kind == DecoratorKindEnum.CLASS) {
      const types = [
        'Character',
        'Date',
        'ForeignKey',
        'Geometric',
        'Index',
        'Join',
        'Language',
        'Many',
        'Network',
        'Numeric',
        'One',
        'Range',
        'Structure',
      ];
      const decorators = DecoratorMetadata.filterByAnnotationInteroperableNames(decorator.decoration.context, types);

      if (decorators) {
        for (const decorator of decorators) {
          if (isColumn(decorator.annotation.target)) {
            this.columns.push({
              key: decorator.decoration.property,
              annotation: decorator.annotation.target,
            });
          }

          if (isForeignKey(decorator.annotation.target)) {
            this.foreignKeys.push({
              key: decorator.decoration.property,
              annotation: decorator.annotation.target,
            });
          }

          if (isRelation(decorator.annotation.target)) {
            this.relations.push({
              key: decorator.decoration.property,
              annotation: decorator.annotation.target,
            });
          }

          if (isIndex(decorator.annotation.target)) {
            this.indexes.push({
              key: decorator.decoration.property,
              annotation: decorator.annotation.target,
            });
          }
        }
      }

      return artifact.target;
    }

    throw new AnnotationException('Method not implemented for {name} on {kind}.', {
      key: 'NOT_IMPLEMENTED',
      context: { name: artifact.name, kind: decorator.decoration.kind },
    });
  }

  onInitialize(_artifact: ArtifactType, _decorator: DecoratorType) {}
}

export default SchemaAnnotation;
