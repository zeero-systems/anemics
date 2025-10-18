import { ApplicationInterface } from './interfaces.ts';

export type EventType = {
  boot: [ ApplicationInterface ]
  start: [ ApplicationInterface ]
  stop: [ ApplicationInterface ]
}


export default {}