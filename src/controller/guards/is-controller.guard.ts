import Controller from '~/controller/annotations/controller.annotation.ts';

export const isController = (x: any): x is Controller => {
  return !!x && x.path && x.scope
};

export default isController;
