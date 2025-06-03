import { Track } from '../../models/events';
import { ApiService } from './api.service';
import { NetworkService } from '../ui/network.service';
import { Faction } from '../../models/faction';
import { Region } from '../../models/region';
import { ConfigService } from '../config/config.service';

export enum TrackEventType {
  CREATED = 'track_created',
  UPDATED = 'track_updated',
  STOPPED = 'track_stopped'
}

export enum SSEEventType {
  CONNECTION_ESTABLISHED = 'connection_established'
}

export class TrackService {
  private static instance: TrackService | null = null;
  private tracks: Map<string, Track> = new Map();
  private eventSource: EventSource | null = null;
  private readonly endpoint = '/tracks';
  private readonly eventsEndpoint = '/api/events/stream';

  private constructor(
    private readonly apiService: ApiService
  ) {}

  public static init(apiService: ApiService): void {
    if (!TrackService.instance) {
      TrackService.instance = new TrackService(apiService);
    }
  }

  public static getInstance(): TrackService {
    if (!TrackService.instance) {
      throw new Error('TrackService не инициализирован. Сначала вызовите init()');
    }
    return TrackService.instance;
  }

  /**
   * Инициализировать SSE соединение
   */
  public initEventSource(): void {
    if (this.eventSource) {
      this.eventSource.close();
    }

    this.eventSource = new EventSource(this.eventsEndpoint);
    this.setupEventSourceListeners();
  }

  /**
   * Настройка слушателей SSE
   */
  private setupEventSourceListeners(): void {
    if (!this.eventSource) return;

    // Обрабатываем все события как триггер для обновления треков
    this.eventSource.addEventListener(TrackEventType.CREATED, () => {
      this.refreshAllTracks();
    });

    this.eventSource.addEventListener(TrackEventType.UPDATED, () => {
      this.refreshAllTracks();
    });

    this.eventSource.addEventListener(TrackEventType.STOPPED, () => {
      this.refreshAllTracks();
    });

    this.eventSource.addEventListener(SSEEventType.CONNECTION_ESTABLISHED, () => {
      console.log('SSE соединение установлено');
      // При установке соединения сразу обновляем все треки
      this.refreshAllTracks();
    });

    this.eventSource.onerror = (error) => {
      console.error('Ошибка SSE соединения:', error);
      // Попытка переподключения через заданное время
      const config = ConfigService.getInstance().getConfig();
      setTimeout(() => this.initEventSource(), config.sse.reconnectDelayMs);
    };
  }

  /**
   * Обновить трек в памяти и обновить отображение
   */
  private async updateTrackInMemory(track: Track): Promise<void> {
    this.tracks.set(track.id, track);
    await NetworkService.getInstance().updateNetworkDisplay();
  }

  /**
   * Получить все активные треки
   */
  public getAllTracks(): Track[] {
    return Array.from(this.tracks.values());
  }

  /**
   * Получить трек по ID
   */
  public getTrackById(trackId: string): Track | undefined {
    return this.tracks.get(trackId);
  }

  /**
   * Получить треки для конкретного региона
   */
  public getTracksByRegion(regionId: string): Track[] {
    return this.getAllTracks().filter(track => track.territory.id === regionId);
  }

  /**
   * Создать новый трек
   */
  public async createTrack(eventId: string, actorId: string): Promise<void> {
    try {
      await this.apiService.post<{ message: string }>(this.endpoint, { eventId, actorId });
    } catch (error) {
      console.error('Ошибка при создании трека:', error);
      throw error;
    }
  }

  /**
   * Остановить трек
   */
  public async stopTrack(trackId: string): Promise<void> {
    try {
      await this.apiService.delete<{ message: string }>(`${this.endpoint}/${trackId}`);
      this.tracks.delete(trackId);
      await NetworkService.getInstance().updateNetworkDisplay();
    } catch (error) {
      console.error('Ошибка при остановке трека:', error);
      throw error;
    }
  }

  /**
   * Обновить все треки
   */
  public async refreshAllTracks(): Promise<void> {
    try {
      const tracks = await this.apiService.get<Track[]>(this.endpoint);
      this.tracks.clear();
      tracks.forEach(track => this.updateTrackInMemory(track));
    } catch (error) {
      console.error('Ошибка при обновлении треков:', error);
      throw error;
    }
  }

  /**
   * Получить активные треки
   */
  public getActiveTracks(): Track[] {
    return Array.from(this.tracks.values());
  }
}

export interface EnrichedFaction extends Faction {
  status: FactionStatus;
  events: Track[];
}

export interface EnrichedRegion extends Region {
  activeTracks: Track[];
}

export interface FactionStatus {
  attack: boolean;
  defence: boolean;
  war: boolean;
  wreckage: boolean;
  peace: boolean;
  diplomacy: boolean;
  spy: boolean;
  trade: boolean;
  capture: boolean;
}
