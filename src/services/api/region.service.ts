import { Region, RegionsType } from '../../models/region';
import { ApiService } from './api.service';
import { NetworkNode, NetworkEdge } from '../ui/network.service';
import { ActorType, RegionStatus } from '../../models/constants';
import { TrackService } from './track.service';
import { ACTION_COLORS, REGION_STATUS_COLORS } from '../../models/track.constants';
import { EventService } from './event.service';
import { SSEService } from './sse.service';
import { BehaviorSubject, Observable, firstValueFrom } from 'rxjs';

const FACTION_COLORS = {
  [ActorType.MILITARY]: '#2E7D32',   // Темно-зеленый
  [ActorType.CIVILIAN]: '#1976D2',   // Синий
  [ActorType.TERRORIST]: '#D32F2F',  // Красный
  NEUTRAL: '#757575'                 // Серый
} as const;

export enum RegionEventType {
  CREATED = 'region_created',
  UPDATED = 'region_updated',
  DELETED = 'region_deleted'
}

export class RegionService {
  private static instance: RegionService | null = null;
  private regions$ = new BehaviorSubject<Region[]>([]);
  private readonly endpoint = '/regions';
  private regions: Region[] = [];
  private static regionIdMap: Map<RegionsType, number> = new Map();
  private sseService = SSEService.getInstance();
  private static colorCache: Map<string, { background: string; border: string; highlight?: { background: string } }> = new Map();
  private static titleCache: Map<string, string> = new Map();
  private static lastUpdateTime: number = 0;
  private static readonly CACHE_TTL = 5000; // 5 секунд

  private constructor(
    private readonly apiService: ApiService
  ) {
    this.initializeEventStream();
  }

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

  private initializeEventStream(): void {
    this.sseService.connect().subscribe({
      next: (message) => {
        if (message.type === RegionEventType.CREATED || 
            message.type === RegionEventType.UPDATED || 
            message.type === RegionEventType.DELETED) {
          this.handleRegionUpdate(message.data, message.type);
        }
      },
      error: (error) => {
        console.error('Ошибка в потоке регионов:', error);
      }
    });
  }

  private async handleRegionUpdate(regionData: Partial<Region>, eventType: RegionEventType): Promise<void> {
    const currentRegions = this.regions$.getValue();
    const regionId = regionData.id!;

    switch (eventType) {
      case RegionEventType.DELETED:
        this.regions$.next(currentRegions.filter(r => r.id !== regionId));
        break;
      case RegionEventType.CREATED:
      case RegionEventType.UPDATED:
        try {
          const updatedRegion = await this.getRegionById(regionId);
          const index = currentRegions.findIndex(r => r.id === regionId);
          if (index === -1) {
            this.regions$.next([...currentRegions, updatedRegion]);
          } else {
            const updatedRegions = [...currentRegions];
            updatedRegions[index] = updatedRegion;
            this.regions$.next(updatedRegions);
          }
        } catch (error) {
          console.error('Ошибка при обновлении региона:', error);
        }
        break;
    }
  }

  /**
   * Получить цвет для региона с учетом статуса и активных треков
   */
  private static async getRegionColor(region: Region): Promise<{ 
    background: string; 
    border: string;
    highlight?: { background: string }
  }> {
    const cacheKey = `${region.id}_${region.status}_${region.faction?.type}`;
    const cachedColor = this.colorCache.get(cacheKey);
    
    if (cachedColor && Date.now() - this.lastUpdateTime < this.CACHE_TTL) {
      return cachedColor;
    }

    const trackService = TrackService.getInstance();
    const activeTracks = await firstValueFrom(trackService.getActiveTracks());
    
    const activeTrack = activeTracks.find(track => track.territoryId === region.id);
    
    let color;
    if (activeTrack) {
      try {
        const eventService = EventService.getInstance();
        const event = await eventService.getEventById(activeTrack.eventId);
        if (event?.actionType) {
          color = {
            background: ACTION_COLORS[event.actionType],
            border: '#000000',
            highlight: { background: ACTION_COLORS[event.actionType] }
          };
        }
      } catch (error) {
        console.error('Ошибка при получении события:', error);
      }
    }

    if (!color) {
      color = {
        background: region.faction 
          ? FACTION_COLORS[region.faction.type]
          : REGION_STATUS_COLORS[region.status] || FACTION_COLORS.NEUTRAL,
        border: '#000000'
      };
    }

    this.colorCache.set(cacheKey, color);
    return color;
  }

  /**
   * Получить описание для региона с учетом активных треков
   */
  private static async getRegionTitle(region: Region): Promise<string> {
    const cacheKey = `${region.id}_${region.status}_${region.faction?.name}`;
    const cachedTitle = this.titleCache.get(cacheKey);
    
    if (cachedTitle && Date.now() - this.lastUpdateTime < this.CACHE_TTL) {
      return cachedTitle;
    }

    const trackService = TrackService.getInstance();
    const activeTracks = await firstValueFrom(trackService.getActiveTracks());
    const activeTrack = activeTracks.find(track => track.territoryId === region.id);

    let title = `${region.title}\nСтатус: ${region.status}\nФракция: ${region.faction?.name || 'Нет'}`;
    
    if (activeTrack) {
      try {
        const eventService = EventService.getInstance();
        const event = await eventService.getEventById(activeTrack.eventId);
        const actorsNames = activeTrack.actors?.map(actor => actor.name).join(', ') || 'Нет участников';
        if (event) {
          title += `\nАктивное действие: ${event.title}\nУчастники: ${actorsNames}`;
        } else {
          title += `\nАктивное действие: Неизвестно\nУчастники: ${actorsNames}`;
        }
      } catch (error) {
        console.error('Ошибка при получении события:', error);
        const actorsNames = activeTrack.actors?.map(actor => actor.name).join(', ') || 'Нет участников';
        title += `\nАктивное действие: Ошибка\nУчастники: ${actorsNames}`;
      }
    }

    this.titleCache.set(cacheKey, title);
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
    // Не очищаем карту ID при каждом обновлении
    // this.clearRegionMap();

    const nodes: NetworkNode[] = await Promise.all(regions.map(async (region) => ({
      id: this.getRegionIndex(region.id),
      label: region.title,
      title: await this.getRegionTitle(region),
      color: await this.getRegionColor(region)
    })));

    const edges: NetworkEdge[] = [];
    const trackService = TrackService.getInstance();
    const activeTracks = await firstValueFrom(trackService.getActiveTracks());

    regions.forEach((region) => {
      region.neighbour.forEach((neighbourId) => {
        const fromId = this.getRegionIndex(region.id);
        const toId = this.getRegionIndex(neighbourId);
        
        const edgeExists = edges.some(
          (edge) => 
            (edge.from === fromId && edge.to === toId) ||
            (edge.from === toId && edge.to === fromId)
        );

        if (!edgeExists) {
          const hasActiveTrack = activeTracks.some(track => 
            track.territoryId === region.id || track.territoryId === neighbourId
          );

          edges.push({
            id: [fromId, toId].sort().join('-'),
            from: fromId,
            to: toId,
            arrows: hasActiveTrack ? 'to' : { to: false },
            color: { color: '#666666' }
          });
        }
      });
    });

    this.lastUpdateTime = Date.now();
    return { nodes, edges };
  }

  public getRegions(): Observable<Region[]> {
    return this.regions$.asObservable();
  }

  public async loadRegions(): Promise<void> {
    const regions = await this.apiService.get<Region[]>(this.endpoint);
    this.regions$.next(regions);
  }

  public async getRegionById(id: string): Promise<Region> {
    return this.apiService.get<Region>(`${this.endpoint}/${id}`);
  }

  public async createRegion(region: Omit<Region, 'id'>): Promise<Region> {
    return this.apiService.post<Region>(this.endpoint, region);
  }

  public async updateRegion(id: string, region: Partial<Region>): Promise<Region> {
    return this.apiService.put<Region>(`${this.endpoint}/${id}`, region);
  }

  public async deleteRegion(id: string): Promise<void> {
    return this.apiService.delete<void>(`${this.endpoint}/${id}`);
  }
} 