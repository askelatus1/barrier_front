export enum SocketMessageType {
  EVENT = 'EVENT',
  START = 'START',
  STOP = 'STOP',
  NOTIFY = 'NOTIFY'
}

export interface SocketMessage {
  type: SocketMessageType;
  payload: any;
} 