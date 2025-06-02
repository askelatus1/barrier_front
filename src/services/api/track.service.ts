import { Track } from '../../models/events';
import { Socket } from 'socket.io-client';
import { ApiService } from './api.service';
import { NetworkService } from '../ui/network.service';

export class TrackService {
  private static instance: TrackService | null = null;
  private tracks: Map<string, Track> = new Map();
  private socket: Socket | null = null;
  private readonly endpoint = '/tracks';

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
   * Установить сокет для прослушивания событий
   */
  public setSocket(socket: Socket): void {
    this.socket = socket;
    this.setupSocketListeners();
  }

  /**
   * Настройка слушателей сокета
   */
  private setupSocketListeners(): void {
    if (!this.socket) return;

    this.socket.on('track:update', (track: Track) => {
      this.updateTrackInMemory(track);
    });

    this.socket.on('track:stop', async (trackId: string) => {
      this.tracks.delete(trackId);
      await NetworkService.getInstance().updateNetworkDisplay();
    });
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
   * Получить активные треки (без статуса)
   */
  public getActiveTracks(): Track[] {
    return this.getAllTracks().filter(track => !track.status);
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
} 