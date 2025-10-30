import ControllerAnnotation from '~/controller/annotations/controller.annotation.ts';

export const isController = (x: any): x is ControllerAnnotation => {
  return !!x && x.name == 'Controller';
};

export default isController;
