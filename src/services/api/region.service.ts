import { Region, RegionsType } from '../../models/region';
import { ApiService } from './api.service';
import { NetworkNode, NetworkEdge } from '../ui/network.service';
import { ActorType, RegionStatus } from '../../models/constants';
import { TrackService } from './track.service';
import { ACTION_COLORS, REGION_STATUS_COLORS } from '../../models/track.constants';
import { EventService } from './event.service';

const FACTION_COLORS = {
  [ActorType.MILITARY]: '#2E7D32',   // Темно-зеленый
  [ActorType.CIVILIAN]: '#1976D2',   // Синий
  [ActorType.TERRORIST]: '#D32F2F',  // Красный
  NEUTRAL: '#757575'                 // Серый
} as const;

export class RegionService {
  private static instance: RegionService | null = null;
  private readonly endpoint = '/regions';
  private regions: Region[] = [];
  private static regionIdMap: Map<RegionsType, number> = new Map();

  private constructor(
    private readonly apiService: ApiService
  ) {}

  public static init(apiService: ApiService): void {
    if (!RegionService.instance) {
      RegionService.instance = new RegionService(apiService);
    }
  }

  public static getInstance(): RegionService {
    if (!RegionService.instance) {
      throw new Error('RegionService не инициализирован. Сначала вызовите init()');
    }
    return RegionService.instance;
  }

  /**
   * Получить цвет для региона с учетом статуса и активных треков
   */
  private static async getRegionColor(region: Region): Promise<{ 
    background: string; 
    border: string;
    highlight?: { background: string }
  }> {
    const trackService = TrackService.getInstance();
    const activeTracks = trackService.getActiveTracks();
    
    // Проверяем, есть ли активные треки для этого региона
    const activeTrack = activeTracks.find(track => track.territory.id === region.id);
    
    if (activeTrack) {
      try {
        // Получаем тип действия из события
        const eventService = EventService.getInstance();
        const event = await eventService.getEventById(activeTrack.eventId);
        if (event && event.actionType) {
          // Если есть активный трек, используем цвет действия события
          const color = ACTION_COLORS[event.actionType];
          return {
            background: color,
            border: '#000000',
            highlight: { background: color }
          };
        }
      } catch (error) {
        console.error('Ошибка при получении события:', error);
      }
    }

    // Если нет активных треков или произошла ошибка, используем цвет статуса региона или фракции
    return {
      background: region.faction 
        ? FACTION_COLORS[region.faction.type]
        : REGION_STATUS_COLORS[region.status] || FACTION_COLORS.NEUTRAL,
      border: '#000000'
    };
  }

  /**
   * Получить описание для региона с учетом активных треков
   */
  private static async getRegionTitle(region: Region): Promise<string> {
    const trackService = TrackService.getInstance();
    const activeTracks = trackService.getActiveTracks();
    const activeTrack = activeTracks.find(track => track.territory.id === region.id);

    let title = `${region.title}\nСтатус: ${region.status}\nФракция: ${region.faction?.name || 'Нет'}`;
    
    if (activeTrack) {
      try {
        const eventService = EventService.getInstance();
        const event = await eventService.getEventById(activeTrack.eventId);
        const actorsNames = activeTrack.actors.map(actor => actor.name).join(', ');
        if (event) {
          title += `\nАктивное действие: ${event.title}\nУчастники: ${actorsNames}`;
        } else {
          title += `\nАктивное действие: Неизвестно\nУчастники: ${actorsNames}`;
        }
      } catch (error) {
        console.error('Ошибка при получении события:', error);
        const actorsNames = activeTrack.actors.map(actor => actor.name).join(', ');
        title += `\nАктивное действие: Ошибка\nУчастники: ${actorsNames}`;
      }
    }

    return title;
  }

  /**
   * Получить числовой индекс для ID региона
   */
  private static getRegionIndex(regionId: RegionsType): number {
    let index = this.regionIdMap.get(regionId);
    if (index === undefined) {
      index = this.regionIdMap.size;
      this.regionIdMap.set(regionId, index);
    }
    return index;
  }

  /**
   * Получить ID региона по числовому индексу
   */
  public static getRegionId(index: number): RegionsType | undefined {
    for (const [id, idx] of this.regionIdMap.entries()) {
      if (idx === index) return id;
    }
    return undefined;
  }

  /**
   * Очистить карту соответствия ID
   */
  public static clearRegionMap(): void {
    this.regionIdMap.clear();
  }

  /**
   * Преобразует массив регионов в структуру узлов и рёбер для vis-network
   */
  public static async convertToNetworkStructure(regions: Region[]): Promise<{
    nodes: NetworkNode[];
    edges: NetworkEdge[];
  }> {
    this.clearRegionMap();

    const nodes: NetworkNode[] = await Promise.all(regions.map(async (region) => ({
      id: this.getRegionIndex(region.id),
      label: region.title,
      title: await this.getRegionTitle(region),
      color: await this.getRegionColor(region)
    })));

    const edges: NetworkEdge[] = [];
    const trackService = TrackService.getInstance();
    const activeTracks = trackService.getActiveTracks();

    regions.forEach((region) => {
      region.neighbour.forEach((neighbourId) => {
        const fromId = this.getRegionIndex(region.id);
        const toId = this.getRegionIndex(neighbourId);
        
        // Проверяем, есть ли уже ребро между этими узлами
        const edgeExists = edges.some(
          (edge) => 
            (edge.from === fromId && edge.to === toId) ||
            (edge.from === toId && edge.to === fromId)
        );
        
        if (!edgeExists) {
          // Проверяем, есть ли активный трек в этом регионе
          const track = activeTracks.find(t => t.territory.id === region.id);

          if (track) {
            // Если есть трек, создаем направленное ребро
            edges.push({
              from: fromId,
              to: toId,
              arrows: {
                to: true
              },
              color: {
                color: '#666666',
                opacity: 0.8
              }
            });
          } else {
            // Если нет трека, создаем обычное ненаправленное ребро
            edges.push({
              from: fromId,
              to: toId,
              arrows: {
                to: false
              },
              color: {
                color: '#666666',
                opacity: 0.8
              }
            });
          }
        }
      });
    });

    return { nodes, edges };
  }

  /**
   * Загрузить все регионы
   */
  public async loadRegions(): Promise<void> {
    this.regions = await this.getAllRegions();
  }

  /**
   * Получить все регионы из кэша
   */
  public getRegions(): Region[] {
    return [...this.regions];
  }

  /**
   * Получить регион по ID из кэша
   */
  public getRegionById(id: string): Region | undefined {
    return this.regions.find(r => r.id === id);
  }

  /**
   * Получить все регионы
   */
  public async getAllRegions(): Promise<Region[]> {
    return this.apiService.get<Region[]>(this.endpoint);
  }

  /**
   * Создать новый регион
   * @param region - данные нового региона
   */
  public async createRegion(region: Omit<Region, 'id'>): Promise<Region> {
    return this.apiService.post<Region>(this.endpoint, region);
  }

  /**
   * Обновить существующий регион
   * @param id - ID региона
   * @param region - обновленные данные региона
   */
  public async updateRegion(id: RegionsType, region: Partial<Region>): Promise<Region> {
    return this.apiService.put<Region>(`${this.endpoint}/${id}`, region);
  }

  /**
   * Частично обновить существующий регион
   * @param id - ID региона
   * @param region - частичные данные для обновления
   */
  public async patchRegion(id: RegionsType, region: Partial<Region>): Promise<Region> {
    return this.apiService.patch<Region>(`${this.endpoint}/${id}`, region);
  }

  /**
   * Удалить регион
   * @param id - ID региона
   */
  public async deleteRegion(id: RegionsType): Promise<void> {
    return this.apiService.delete<void>(`${this.endpoint}/${id}`);
  }
} 