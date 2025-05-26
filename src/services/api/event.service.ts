import { BarrierEvent, Track } from '../../models/events';
import { ApiService } from './api.service';

export class EventService {
  private static instance: EventService | null = null;
  private readonly endpoint = '/events';

  private constructor(
    private readonly apiService: ApiService
  ) {}

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

  /**
   * Получить все события
   */
  public async getAllEvents(): Promise<BarrierEvent[]> {
    return this.apiService.get<BarrierEvent[]>(this.endpoint);
  }

  /**
   * Получить событие по ID
   */
  public async getEventById(id: string): Promise<BarrierEvent> {
    return this.apiService.get<BarrierEvent>(`${this.endpoint}/${id}`);
  }

  /**
   * Получить треки события
   */
  public async getEventTracks(eventId: string): Promise<Track[]> {
    return this.apiService.get<Track[]>(`${this.endpoint}/${eventId}/tracks`);
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
    return this.apiService.put<BarrierEvent>(`${this.endpoint}/${id}`, event);
  }

  /**
   * Частично обновить существующее событие
   */
  public async patchEvent(id: string, event: Partial<BarrierEvent>): Promise<BarrierEvent> {
    return this.apiService.patch<BarrierEvent>(`${this.endpoint}/${id}`, event);
  }

  /**
   * Удалить событие
   */
  public async deleteEvent(id: string): Promise<void> {
    return this.apiService.delete<void>(`${this.endpoint}/${id}`);
  }

  /**
   * Создать трек для события
   */
  public async createTrack(eventId: string, track: Omit<Track, 'id'>): Promise<Track> {
    return this.apiService.post<Track>(`${this.endpoint}/${eventId}/tracks`, track);
  }

  /**
   * Обновить трек события
   */
  public async updateTrack(eventId: string, trackId: string, track: Partial<Track>): Promise<Track> {
    return this.apiService.put<Track>(`${this.endpoint}/${eventId}/tracks/${trackId}`, track);
  }

  /**
   * Удалить трек события
   */
  public async deleteTrack(eventId: string, trackId: string): Promise<void> {
    return this.apiService.delete<void>(`${this.endpoint}/${eventId}/tracks/${trackId}`);
  }
} 