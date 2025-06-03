import { ApiService } from './api.service';
import { Faction, FactionId } from '../../models/faction';
import { UiFaction } from '../../models/ui.types';
import { ActorType } from '../../models/constants';

export class ActorService {
  private static instance: ActorService | null = null;
  private actors: Map<string, Faction> = new Map();
  private factions: Faction[] = [];
  private readonly endpoint = '/actors';

  private readonly factionLogos: Record<ActorType, string> = {
    [ActorType.MILITARY]: '/factions/military.svg',
    [ActorType.CIVILIAN]: '/factions/civilian.svg',
    [ActorType.TERRORIST]: '/factions/terrorist.svg'
  };

  private constructor(
    private readonly apiService: ApiService
  ) {}

  public static init(apiService: ApiService): void {
    if (!ActorService.instance) {
      ActorService.instance = new ActorService(apiService);
    }
  }

  public static getInstance(): ActorService {
    if (!ActorService.instance) {
      throw new Error('ActorService не инициализирован. Сначала вызовите init()');
    }
    return ActorService.instance;
  }

  public async getAllActors(): Promise<Faction[]> {
    try {
      const actors = await this.apiService.get<Faction[]>('/actors');
      this.actors.clear();
      actors.forEach(actor => this.actors.set(actor.id, actor));
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
   * Преобразовать Faction в UiFaction
   */
  public convertToUiFaction(faction: Faction): UiFaction {
    return {
      name: faction.name,
      type: faction.type,
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
  }

  /**
   * Получить UI-представление всех фракций
   */
  public async getUiFactions(): Promise<UiFaction[]> {
    const factions = await this.getAllActors();
    return factions.map(faction => this.convertToUiFaction(faction));
  }

  /**
   * Получить UI-представление фракции по ID
   */
  public async getUiFactionById(id: FactionId): Promise<UiFaction> {
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
} 