import { ApiService } from './api.service';
import { Faction, FactionId, DisplayedFaction } from '../../models/faction';
import { ActorType } from '../../models/constants';
import { SSEService } from './sse.service';
import { SSEEventType } from '../../models/constants';
import { BehaviorSubject, Observable } from 'rxjs';
import { ActionType } from '../../models/events';
import { TrackService } from './track.service';
import { EventService } from './event.service';

export class ActorService {
  private static instance: ActorService | null = null;
  private actors: Map<string, Faction> = new Map();
  private displayedActors: Map<string, DisplayedFaction> = new Map();
  private displayedActors$ = new BehaviorSubject<Map<string, DisplayedFaction>>(new Map());
  private factions: Faction[] = [];
  private readonly endpoint = '/actors';

  private readonly factionLogos: Record<ActorType, string> = {
    [ActorType.MILITARY]: '/factions/military.svg',
    [ActorType.CIVILIAN]: '/factions/civilian.svg',
    [ActorType.TERRORIST]: '/factions/terrorist.svg'
  };

  private constructor(
    private readonly apiService: ApiService,
    private readonly trackService: TrackService,
    private readonly eventService: EventService,
    private readonly sseService: SSEService
  ) {
    this.initializeEventStream();
  }

  public static init(
    apiService: ApiService,
    trackService: TrackService,
    eventService: EventService,
    sseService: SSEService
  ): void {
    if (!ActorService.instance) {
      ActorService.instance = new ActorService(apiService, trackService, eventService, sseService);
    }
  }

  public static getInstance(): ActorService {
    if (!ActorService.instance) {
      throw new Error('ActorService не инициализирован. Сначала вызовите init()');
    }
    return ActorService.instance;
  }

  private initializeEventStream(): void {
    this.sseService.connect().subscribe({
      next: (message) => {
        if (message.type === SSEEventType.TRACK_CREATED || 
            message.type === SSEEventType.TRACK_UPDATED || 
            message.type === SSEEventType.TRACK_STOPPED) {
          this.refreshDisplayedActors();
        }
      },
      error: (error) => {
        console.error('Ошибка в потоке треков:', error);
      }
    });
  }

  private async refreshDisplayedActors(): Promise<void> {
    try {
      const tracks = await this.trackService.getAllTracks();
      const events = await this.eventService.getAllEvents();
      
      // Сбрасываем все статусы
      this.displayedActors.forEach((faction, id) => {
        this.displayedActors.set(id, {
          ...faction,
          active: false,
          attack: false,
          defence: false,
          war: false,
          wreckage: false,
          peace: false,
          diplomacy: false,
          spy: false,
          trade: false,
          capture: false
        });
      });

      // Обновляем статусы на основе активных треков
      tracks.forEach(track => {
        const event = events.find(e => e.id === track.eventId);
        if (!event) return;

        track.actors.forEach(actor => {
          const displayedFaction = this.displayedActors.get(actor.id);
          if (displayedFaction) {
            const updatedFaction: DisplayedFaction = {
              ...displayedFaction,
              active: true,
              // Определяем тип действия на основе actionType события
              attack: event.actionType === ActionType.WAR,
              defence: event.actionType === ActionType.WAR,
              war: event.actionType === ActionType.WAR,
              wreckage: event.actionType === ActionType.WRECKAGE,
              peace: event.actionType === ActionType.PEACE,
              diplomacy: event.actionType === ActionType.DIPLOMACY,
              spy: event.actionType === ActionType.ESPIONAGE,
              trade: event.actionType === ActionType.TRADE,
              capture: event.actionType === ActionType.CAPTURE
            };
            this.displayedActors.set(actor.id, updatedFaction);
          }
        });
      });

      this.displayedActors$.next(new Map(this.displayedActors));
    } catch (error) {
      console.error('Ошибка при обновлении отображаемых акторов:', error);
    }
  }

  public getDisplayedActors(): Observable<Map<string, DisplayedFaction>> {
    return this.displayedActors$.asObservable();
  }

  public async getAllActors(forceRefresh: boolean = false): Promise<Faction[]> {
    if (!this.isCacheEmpty() && !forceRefresh) {
      return this.getActorsFromCache();
    }

    try {
      const actors = await this.apiService.get<Faction[]>('/actors');
      this.updateCache(actors);
      return actors;
    } catch (error) {
      console.error('Ошибка при получении акторов:', error);
      throw error;
    }
  }

  public async getActorById(id: string): Promise<Faction> {
    try {
      const actor = await this.apiService.get<Faction>(`/actors/${id}`);
      this.actors.set(actor.id, actor);
      return actor;
    } catch (error) {
      console.error(`Ошибка при получении актора ${id}:`, error);
      throw error;
    }
  }

  /**
   * Создать нового актора
   */
  public async createActor(actor: Omit<Faction, 'id'>): Promise<Faction> {
    return this.apiService.post<Faction>(this.endpoint, actor);
  }

  /**
   * Обновить существующего актора
   */
  public async updateActor(id: FactionId, actor: Partial<Faction>): Promise<Faction> {
    return this.apiService.put<Faction>(`${this.endpoint}/${id}`, actor);
  }

  /**
   * Частично обновить существующего актора
   */
  public async patchActor(id: FactionId, actor: Partial<Faction>): Promise<Faction> {
    return this.apiService.patch<Faction>(`${this.endpoint}/${id}`, actor);
  }

  /**
   * Удалить актора
   */
  public async deleteActor(id: FactionId): Promise<void> {
    return this.apiService.delete<void>(`${this.endpoint}/${id}`);
  }

  /**
   * Преобразовать Faction в DisplayedFaction
   */
  public convertToUiFaction(faction: Faction): DisplayedFaction {
    const displayedFaction: DisplayedFaction = {
      id: faction.id,
      name: faction.name,
      type: faction.type,
      baseRegion: faction.baseRegion,
      logo: this.factionLogos[faction.type] || '/factions/default.svg',
      active: false,
      attack: false,
      defence: false,
      war: false,
      wreckage: false,
      peace: false,
      diplomacy: false,
      spy: false,
      trade: false,
      capture: false
    };

    // Сохраняем в кэш
    this.displayedActors.set(faction.id, displayedFaction);
    this.displayedActors$.next(new Map(this.displayedActors));

    return displayedFaction;
  }

  /**
   * Получить UI-представление всех фракций
   */
  public async getUiFactions(): Promise<DisplayedFaction[]> {
    const factions = await this.getAllActors();
    return factions.map(faction => this.convertToUiFaction(faction));
  }

  /**
   * Получить UI-представление фракции по ID
   */
  public async getUiFactionById(id: FactionId): Promise<DisplayedFaction> {
    const faction = await this.getActorById(id.toString());
    return this.convertToUiFaction(faction);
  }

  /**
   * Загрузить все фракции
   */
  public async loadFactions(): Promise<void> {
    this.factions = await this.getAllActors();
  }

  /**
   * Получить все фракции из кэша
   */
  public getFactions(): Faction[] {
    return [...this.factions];
  }

  /**
   * Получить фракцию по ID из кэша
   */
  public getFactionById(id: string): Faction | undefined {
    return this.actors.get(id);
  }

  /**
   * Обновить кэш акторов
   */
  private updateCache(actors: Faction[]): void {
    this.actors.clear();
    this.displayedActors.clear();
    
    actors.forEach(actor => {
      this.actors.set(actor.id, actor);
      this.convertToUiFaction(actor);
    });
  }

  /**
   * Очистить кэш акторов
   */
  public clearCache(): void {
    this.actors.clear();
    this.displayedActors.clear();
    this.displayedActors$.next(new Map());
  }

  /**
   * Проверить, пуст ли кэш
   */
  public isCacheEmpty(): boolean {
    return this.actors.size === 0;
  }

  /**
   * Получить размер кэша
   */
  public getCacheSize(): number {
    return this.actors.size;
  }

  /**
   * Получить всех акторов из локального кэша
   */
  public getActorsFromCache(): Faction[] {
    return Array.from(this.actors.values());
  }
} 