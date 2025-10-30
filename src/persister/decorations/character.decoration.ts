import { DecorationFunctionType, Decorator } from '@zeero/commons';

import CharacterAnnotation from '~/persister/annotations/character.annotation.ts';

export const Character: DecorationFunctionType<typeof CharacterAnnotation> = Decorator.create(CharacterAnnotation);

export default Character;
