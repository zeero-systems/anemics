import SchemaAnnotation from '~/persister/annotations/schema.annotation.ts';

export const isSchema = (x: any): x is SchemaAnnotation => {
  return !!x && x.name == 'Schema';
};

export default isSchema;
