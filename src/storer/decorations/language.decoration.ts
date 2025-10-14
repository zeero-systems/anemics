import { DecorationFunctionType, Decorator } from '@zeero/commons';

import LanguageAnnotation from '~/storer/annotations/language.annotation.ts'

export const Language: DecorationFunctionType<typeof LanguageAnnotation> = Decorator.create(LanguageAnnotation)

export default Language
