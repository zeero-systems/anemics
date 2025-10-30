import { DecorationFunctionType, Decorator } from '@zeero/commons';

import OptionsAnnotation from '~/controller/annotations/options.annotation.ts';

export const Options: DecorationFunctionType<typeof OptionsAnnotation> = Decorator.create(OptionsAnnotation);

export default Options;
