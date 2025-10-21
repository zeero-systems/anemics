import EventEnum from '~/controller/enums/event.enum.ts';

export type HandlerType = {
  event: `${EventEnum}`
  attempts: number 
  error?: any
}

export default {}