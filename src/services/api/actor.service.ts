import { Faction, FactionId } from '../../models/faction';
import { UiFaction } from '../../models/ui.types';
import { ApiService } from './api.service';
import { ActorType } from '../../models/constants';

export class ActorService {
  private static instance: ActorService | null = null;
  private readonly endpoint = '/actors';
  private readonly factionLogos: Record<string, string> = {
    'Галактическая Империя': '/factions/empire.svg',
    'Альянс Свободных Планет': '/factions/alliance.svg',
    'Конфедерация Независимых Систем': '/factions/cis.svg',
    'Мандалорский Клан': '/factions/mandalore.svg',
    'Торговая Федерация': '/factions/trade-federation.svg',
    'Орден Джедаев': '/factions/jedi.svg',
    'Ситхи': '/factions/sith.svg',
    'Хаттский Картель': '/factions/hutt.svg',
    'Клан Вуки': '/factions/wookie.svg',
    'Гильдия Наемников': '/factions/bounty-hunters.svg'
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

  /**
   * Получить всех акторов
   */
  public async getAllActors(): Promise<Faction[]> {
    return this.apiService.get<Faction[]>(this.endpoint);
  }

  /**
   * Получить актора по ID
   */
  public async getActorById(id: FactionId): Promise<Faction> {
    return this.apiService.get<Faction>(`${this.endpoint}/${id}`);
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
      logo: this.factionLogos[faction.name] || '/factions/default.svg',
      type: faction.type,
      // Генерируем случайные значения для демонстрации
      // В реальном приложении эти значения должны приходить с бекенда
      active: Math.random() > 0.5,
      attack: Math.random() > 0.7,
      defence: Math.random() > 0.7,
      war: Math.random() > 0.8,
      wreckage: Math.random() > 0.9,
      peace: Math.random() > 0.7,
      diplomacy: Math.random() > 0.7,
      spy: Math.random() > 0.8,
      trade: Math.random() > 0.7,
      capture: Math.random() > 0.9
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
    const faction = await this.getActorById(id);
    return this.convertToUiFaction(faction);
  }
} 