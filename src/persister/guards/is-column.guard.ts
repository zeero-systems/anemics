import { ColumnInterface } from '~/persister/interfaces.ts';

export const isColumn = (x: any): x is ColumnInterface => {
  return !!x && [
    'Character',
    'Date',
    'Geometric',
    'Language',
    'Network',
    'Numeric',
    'Range',
    'Structure',
  ].includes(x.name);
};

export default isColumn;
