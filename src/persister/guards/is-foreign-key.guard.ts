import { ForeignKeyInterface } from '~/persister/interfaces.ts';

export const isForeignKey = (x: any): x is ForeignKeyInterface => {
  return !!x && x.name == 'ForeignKey';
};

export default isForeignKey;
