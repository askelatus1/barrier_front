import { Observable, BehaviorSubject, ReplaySubject, throwError, timer } from 'rxjs';
import { catchError, take, tap, share, filter } from 'rxjs/operators';

export interface EventMessage {
  id: string;
  type: string;
  data: any;
  timestamp: number;
}

export class SSEService {
  private static instance: SSEService | null = null;
  private readonly BUFFER_SIZE = 20;
  private readonly RETRY_DELAY = 5000; // 5 seconds
  private readonly MAX_RETRIES = 3;

  private eventSource: EventSource | null = null;
  private events$ = new ReplaySubject<EventMessage>(this.BUFFER_SIZE);
  private isConnected$ = new BehaviorSubject<boolean>(false);
  private retryCount = 0;

  private constructor() {}

  public static getInstance(): SSEService {
    if (!SSEService.instance) {
      SSEService.instance = new SSEService();
    }
    return SSEService.instance;
  }

  public initialize(): void {
    if (this.eventSource) {
      console.warn('SSEService уже инициализирован');
      return;
    }
    console.log('Инициализация SSEService');
  }

  public connect(): Observable<EventMessage> {
    if (this.eventSource) {
      return this.events$.asObservable();
    }

    this.eventSource = new EventSource('/api/events/stream');

    this.eventSource.onopen = () => {
      this.isConnected$.next(true);
      this.retryCount = 0;
      console.log('SSE соединение установлено');
    };

    this.eventSource.onerror = (error) => {
      this.isConnected$.next(false);
      this.handleError(error);
    };

    this.eventSource.onmessage = (event) => {
      try {
        const message: EventMessage = {
          id: event.lastEventId,
          type: event.type,
          data: JSON.parse(event.data),
          timestamp: Date.now()
        };
        this.events$.next(message);
      } catch (error) {
        console.error('Ошибка парсинга сообщения:', error);
      }
    };

    return this.events$.asObservable().pipe(
      share(),
      catchError(error => {
        console.error('Ошибка в потоке событий:', error);
        return throwError(() => error);
      })
    );
  }

  public disconnect(): void {
    if (this.eventSource) {
      this.eventSource.close();
      this.eventSource = null;
      this.isConnected$.next(false);
      console.log('SSE соединение закрыто');
    }
  }

  public getConnectionStatus(): Observable<boolean> {
    return this.isConnected$.asObservable();
  }

  private handleError(error: Event): void {
    if (this.retryCount < this.MAX_RETRIES) {
      this.retryCount++;
      this.disconnect();
      
      console.log(`Попытка переподключения ${this.retryCount}/${this.MAX_RETRIES}`);
      timer(this.RETRY_DELAY).pipe(
        take(1),
        tap(() => this.connect())
      ).subscribe();
    } else {
      this.disconnect();
      this.events$.error(new Error('Достигнут лимит попыток переподключения'));
    }
  }

  public filterEventsByType(type: string): Observable<EventMessage> {
    return this.events$.asObservable().pipe(
      filter(event => event.type === type)
    );
  }
} 