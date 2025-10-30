import { DecorationFunctionType, Decorator } from '@zeero/commons';

import SchemaAnnotation from '~/persister/annotations/schema.annotation.ts';

export const Schema: DecorationFunctionType<typeof SchemaAnnotation> = Decorator.create(SchemaAnnotation);

export default Schema;
