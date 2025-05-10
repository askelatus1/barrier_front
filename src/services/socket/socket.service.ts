import { io, Socket } from 'socket.io-client';
import { Observable, Subject, BehaviorSubject } from 'rxjs';
import { filter } from 'rxjs/operators';
import { SocketMessage, SocketMessageType } from './types';

export class SocketService {
  private socket: Socket | null = null;
  private message$ = new Subject<SocketMessage>();
  private connected$ = new BehaviorSubject<boolean>(false);

  constructor(private url: string) {}

  public connect(): void {
    if (this.socket) {
      return;
    }

    this.socket = io(this.url);

    this.socket.on('connect', () => {
      this.connected$.next(true);
    });

    this.socket.on('disconnect', () => {
      this.connected$.next(false);
    });

    this.socket.on('message', (message: SocketMessage) => {
      this.message$.next(message);
    });
  }

  public disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  public subscribe(type: SocketMessageType): Observable<SocketMessage> {
    return this.message$.pipe(
      filter(message => message.type === type)
    );
  }

  public sendMessage(message: SocketMessage): void {
    if (this.socket && this.connected$.value) {
      this.socket.emit('message', message);
    }
  }

  public isConnected(): Observable<boolean> {
    return this.connected$.asObservable();
  }
} 