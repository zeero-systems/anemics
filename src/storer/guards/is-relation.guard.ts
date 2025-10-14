import { AnnotationInterface } from '@zeero/commons';
import { RelationInterface } from '~/storer/interfaces.ts';

export const isRelation = (x: any): x is RelationInterface & AnnotationInterface => {
  return !!x && ['Relation', 'Many', 'One'].includes(x.name) 
};

export default isRelation;
