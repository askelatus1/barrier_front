import { Track } from '../../models/events';
import { ApiService } from './api.service';
import { NetworkService } from '../ui/network.service';
import { Faction } from '../../models/faction';
import { Region } from '../../models/region';
import { SSEService } from './sse.service';
import { BehaviorSubject, Observable, map } from 'rxjs';

export enum TrackEventType {
  CREATED = 'track_created',
  UPDATED = 'track_updated',
  STOPPED = 'track_stopped'
}

export class TrackService {
  private static instance: TrackService | null = null;
  private tracks$ = new BehaviorSubject<Map<string, Track>>(new Map());
  private readonly endpoint = '/tracks';
  private sseService = SSEService.getInstance();

  private constructor(
    private readonly apiService: ApiService
  ) {
    this.initializeEventStream();
  }

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

  private initializeEventStream(): void {
    this.sseService.connect().subscribe({
      next: (message) => {
        if (message.type === TrackEventType.CREATED || 
            message.type === TrackEventType.UPDATED || 
            message.type === TrackEventType.STOPPED) {
          // При любом событии просто обновляем все треки
          this.refreshAllTracks();
        }
      },
      error: (error) => {
        console.error('Ошибка в потоке треков:', error);
      }
    });
  }

  public getTracks(): Observable<Map<string, Track>> {
    return this.tracks$.asObservable();
  }

  /**
   * Обновить трек в памяти и обновить отображение
   */
  private async updateTrackInMemory(track: Track): Promise<void> {
    const currentTracks = this.tracks$.getValue();
    currentTracks.set(track.id, track);
    this.tracks$.next(new Map(currentTracks));
    await NetworkService.getInstance().updateNetworkDisplay();
  }

  /**
   * Получить все активные треки
   */
  public async getAllTracks(): Promise<Track[]> {
    const tracks = await this.apiService.get<Track[]>(this.endpoint);
    const tracksMap = new Map(tracks.map(track => [track.id, track]));
    this.tracks$.next(tracksMap);
    return tracks;
  }

  /**
   * Получить трек по ID
   */
  public async getTrackById(trackId: string): Promise<Track> {
    return this.apiService.get<Track>(`${this.endpoint}/${trackId}`);
  }

  /**
   * Получить треки для конкретного региона
   */
  public getTracksByRegion(regionId: string): Observable<Track[]> {
    return this.tracks$.pipe(
      map(tracksMap => Array.from(tracksMap.values())
        .filter(track => track.territoryId === regionId))
    );
  }

  /**
   * Создать новый трек
   */
  public async createTrack(track: Omit<Track, 'id'>): Promise<Track> {
    const newTrack = await this.apiService.post<Track>(this.endpoint, track);
    await this.updateTrackInMemory(newTrack);
    return newTrack;
  }

  /**
   * Остановить трек
   */
  public async stopTrack(trackId: string): Promise<void> {
    try {
      await this.apiService.delete<{ message: string }>(`${this.endpoint}/${trackId}`);
      const currentTracks = this.tracks$.getValue();
      currentTracks.delete(trackId);
      this.tracks$.next(new Map(currentTracks));
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
      const tracksMap = new Map(tracks.map(track => [track.id, track]));
      this.tracks$.next(tracksMap);
    } catch (error) {
      console.error('Ошибка при обновлении треков:', error);
      throw error;
    }
  }

  /**
   * Получить активные треки
   */
  public getActiveTracks(): Observable<Track[]> {
    return this.tracks$.pipe(
      map(tracksMap => Array.from(tracksMap.values()))
    );
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
