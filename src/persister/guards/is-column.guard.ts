import { ColumnInterface } from '~/persister/interfaces.ts';

export const isColumn = (x: any): x is ColumnInterface => {
  return !!x && x.name === 'Column';
};

export default isColumn;
