import { BarrierEvent, Track } from '../../models/events';
import { ApiService } from './api.service';
import { SSEService } from './sse.service';
import { BehaviorSubject, Observable } from 'rxjs';
import { SSEEventType } from '../../models/constants';

export class EventService {
  private static instance: EventService | null = null;
  private readonly endpoint = '/events';
  private events$ = new BehaviorSubject<BarrierEvent[]>([]);
  private sseService = SSEService.getInstance();
  private eventCache = new Map<string, any>(); // Универсальный кэш для разных методов

  private constructor(
    private readonly apiService: ApiService
  ) {
    this.initializeEventStream();
  }

  public static init(apiService: ApiService): void {
    if (!EventService.instance) {
      EventService.instance = new EventService(apiService);
    }
  }

  public static getInstance(): EventService {
    if (!EventService.instance) {
      throw new Error('EventService не инициализирован. Сначала вызовите init()');
    }
    return EventService.instance;
  }

  private initializeEventStream(): void {
    this.sseService.connect().subscribe({
      next: (message) => {
        if (message.type === SSEEventType.EVENT_UPDATED || message.type === SSEEventType.EVENT_CREATED) {
          this.handleEventUpdate(message.data);
        }
      },
      error: (error) => {
        console.error('Ошибка в потоке событий:', error);
      }
    });
  }

  private async handleEventUpdate(eventData: Partial<BarrierEvent>): Promise<void> {
    const currentEvents = this.events$.getValue();
    const eventIndex = currentEvents.findIndex(e => e.id === eventData.id);

    if (eventIndex === -1) {
      // Новое событие
      const newEvent = await this.getEventById(eventData.id!);
      this.events$.next([...currentEvents, newEvent]);
    } else {
      // Обновление существующего события
      const updatedEvent = await this.getEventById(eventData.id!);
      const updatedEvents = [...currentEvents];
      updatedEvents[eventIndex] = updatedEvent;
      this.events$.next(updatedEvents);
    }
  }

  public getEvents(): Observable<BarrierEvent[]> {
    return this.events$.asObservable();
  }

  /**
   * Получить все события
   */
  public async getAllEvents(): Promise<BarrierEvent[]> {
    const events = await this.apiService.get<BarrierEvent[]>(this.endpoint);
    this.events$.next(events);
    return events;
  }

  /**
   * Получить событие по ID
   */
  public async getEventById(id: string): Promise<BarrierEvent> {
    const cacheKey = `getEventById:${id}`;
    if (this.eventCache.has(cacheKey)) {
      return this.eventCache.get(cacheKey)!;
    }
    const event = await this.apiService.get<BarrierEvent>(`${this.endpoint}/${id}`);
    this.eventCache.set(cacheKey, event);
    return event;
  }

  /**
   * Получить треки события
   */
  public async getEventTracks(eventId: string): Promise<Track[]> {
    const cacheKey = `getEventTracks:${eventId}`;
    if (this.eventCache.has(cacheKey)) {
      return this.eventCache.get(cacheKey)!;
    }
    const tracks = await this.apiService.get<Track[]>(`${this.endpoint}/${eventId}/tracks`);
    this.eventCache.set(cacheKey, tracks);
    return tracks;
  }

  /**
   * Создать новое событие
   */
  public async createEvent(event: Omit<BarrierEvent, 'id'>): Promise<BarrierEvent> {
    return this.apiService.post<BarrierEvent>(this.endpoint, event);
  }

  /**
   * Обновить существующее событие
   */
  public async updateEvent(id: string, event: Partial<BarrierEvent>): Promise<BarrierEvent> {
    const updated = await this.apiService.put<BarrierEvent>(`${this.endpoint}/${id}`, event);
    this.eventCache.set(`getEventById:${id}`, updated); // Обновляем кэш события
    // Треки события могли измениться — сбрасываем кэш треков
    this.eventCache.delete(`getEventTracks:${id}`);
    return updated;
  }

  /**
   * Частично обновить существующее событие
   */
  public async patchEvent(id: string, event: Partial<BarrierEvent>): Promise<BarrierEvent> {
    const patched = await this.apiService.patch<BarrierEvent>(`${this.endpoint}/${id}`, event);
    this.eventCache.set(`getEventById:${id}`, patched); // Обновляем кэш события
    this.eventCache.delete(`getEventTracks:${id}`);
    return patched;
  }

  /**
   * Удалить событие
   */
  public async deleteEvent(id: string): Promise<void> {
    await this.apiService.delete<void>(`${this.endpoint}/${id}`);
    this.eventCache.delete(`getEventById:${id}`);
    this.eventCache.delete(`getEventTracks:${id}`);
  }

  /**
   * Создать трек для события
   */
  public async createTrack(eventId: string, track: Omit<Track, 'id'>): Promise<Track> {
    const created = await this.apiService.post<Track>(`${this.endpoint}/${eventId}/tracks`, track);
    this.eventCache.delete(`getEventTracks:${eventId}`); // Сброс кэша треков
    return created;
  }

  /**
   * Обновить трек события
   */
  public async updateTrack(eventId: string, trackId: string, track: Partial<Track>): Promise<Track> {
    const updated = await this.apiService.put<Track>(`${this.endpoint}/${eventId}/tracks/${trackId}`, track);
    this.eventCache.delete(`getEventTracks:${eventId}`); // Сброс кэша треков
    return updated;
  }

  /**
   * Удалить трек события
   */
  public async deleteTrack(eventId: string, trackId: string): Promise<void> {
    await this.apiService.delete<void>(`${this.endpoint}/${eventId}/tracks/${trackId}`);
    this.eventCache.delete(`getEventTracks:${eventId}`); // Сброс кэша треков
  }
} 