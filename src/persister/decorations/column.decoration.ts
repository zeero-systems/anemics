import { DecorationFunctionType, Decorator } from '@zeero/commons';

import ColumnAnnotation from '~/persister/annotations/column.annotation.ts';

export const Column: DecorationFunctionType<typeof ColumnAnnotation> = Decorator.create(ColumnAnnotation);

export default Column;
