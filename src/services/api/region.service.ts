import { Region, RegionsType } from '../../models/region';
import { ApiService } from './api.service';
import { NetworkNode, NetworkEdge } from '../ui/network.service';
import { ActorType } from '../../models/constants';

const FACTION_COLORS = {
  [ActorType.MILITARY]: '#2E7D32',   // Темно-зеленый
  [ActorType.CIVILIAN]: '#1976D2',   // Синий
  [ActorType.TERRORIST]: '#D32F2F',  // Красный
  NEUTRAL: '#757575'                 // Серый
} as const;

export class RegionService {
  private static instance: RegionService | null = null;
  private readonly endpoint = '/regions';
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
   * Получить цвет для фракции по её типу
   */
  private static getFactionColor(type: ActorType | undefined): string {
    return type ? FACTION_COLORS[type] : FACTION_COLORS.NEUTRAL;
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
   * @param regions - массив регионов
   * @returns объект с узлами и рёбрами для vis-network
   */
  public static convertToNetworkStructure(regions: Region[]): {
    nodes: NetworkNode[];
    edges: NetworkEdge[];
  } {
    // Очищаем карту перед новой конвертацией
    this.clearRegionMap();

    const nodes: NetworkNode[] = regions.map((region) => ({
      id: this.getRegionIndex(region.id),
      label: region.title,
      title: `${region.title}\nСтатус: ${region.status}\nФракция: ${region.faction?.name || 'Нет'}`,
      color: {
        background: this.getFactionColor(region.faction?.type),
        border: '#000000'
      }
    }));

    const edges: NetworkEdge[] = [];
    regions.forEach((region) => {
      region.neighbour.forEach((neighbourId) => {
        const fromId = this.getRegionIndex(region.id);
        const toId = this.getRegionIndex(neighbourId);
        
        // Добавляем ребро только если оно еще не существует
        const edgeExists = edges.some(
          (edge) => 
            (edge.from === fromId && edge.to === toId) ||
            (edge.from === toId && edge.to === fromId)
        );
        
        if (!edgeExists) {
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
      });
    });

    return { nodes, edges };
  }

  /**
   * Получить все регионы
   */
  public async getAllRegions(): Promise<Region[]> {
    return this.apiService.get<Region[]>(this.endpoint);
  }

  /**
   * Получить регион по ID
   * @param id - ID региона
   */
  public async getRegionById(id: RegionsType): Promise<Region> {
    return this.apiService.get<Region>(`${this.endpoint}/${id}`);
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