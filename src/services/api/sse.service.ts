import { Observable, BehaviorSubject, ReplaySubject, throwError, timer, Subject } from 'rxjs';
import { catchError, take, tap, share, filter } from 'rxjs/operators';
import { ConfigService } from '../config/config.service';
import { SSEEventType } from '../../models/constants';

export interface EventMessage {
  id: string;
  type: SSEEventType;
  data: any;
  timestamp: number;
}

export interface SSEMessage {
  type: string;
  data: any;
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
  private messageSubject = new Subject<SSEMessage>();
  private config = ConfigService.getInstance().getConfig();

  private constructor() {}

  public static getInstance(): SSEService {
    if (!SSEService.instance) {
      SSEService.instance = new SSEService();
    }
    return SSEService.instance;
  }

  public initialize(): void {
    if (this.eventSource) {
      this.eventSource.close();
    }

    const url = `${this.config.api.baseUrl}/events/stream`;
    console.log('Connecting to SSE:', url);
    this.eventSource = new EventSource(url);
    this.setupEventSourceListeners();
  }

  private setupEventSourceListeners(): void {
    if (!this.eventSource) return;

    this.eventSource.onopen = () => {
      console.log('SSE соединение установлено');
      this.isConnected$.next(true);
      this.retryCount = 0;
    };

    this.eventSource.onmessage = (event) => {
      try {
        const message = JSON.parse(event.data);
        this.messageSubject.next(message);
      } catch (error) {
        console.error('Error parsing SSE message:', error);
      }
    };

    this.eventSource.onerror = (error) => {
      console.error('SSE connection error:', error);
      this.isConnected$.next(false);
      // Попытка переподключения через заданное время
      setTimeout(() => this.initialize(), this.config.sse.reconnectDelayMs);
    };
  }

  public connect(): Observable<SSEMessage> {
    return this.messageSubject.asObservable();
  }

  public disconnect(): void {
    if (this.eventSource) {
      this.eventSource.close();
      this.eventSource = null;
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

  public filterEventsByType(type: SSEEventType): Observable<EventMessage> {
    return this.events$.asObservable().pipe(
      filter(event => event.type === type)
    );
  }
} 