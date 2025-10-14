import { DecorationFunctionType, Decorator } from '@zeero/commons';

import CharacterAnnotation from '~/storer/annotations/character.annotation.ts'

export const Character: DecorationFunctionType<typeof CharacterAnnotation> = Decorator.create(CharacterAnnotation)

export default Character
