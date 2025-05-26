import { Region } from '../../models/region';
import { FactionId } from '../../models/faction';
import { ApiService } from './api.service';

export class ZoneService {
  private static instance: ZoneService | null = null;
  private readonly endpoint = '/zones';

  private constructor(
    private readonly apiService: ApiService
  ) {}

  public static init(apiService: ApiService): void {
    if (!ZoneService.instance) {
      ZoneService.instance = new ZoneService(apiService);
    }
  }

  public static getInstance(): ZoneService {
    if (!ZoneService.instance) {
      throw new Error('ZoneService не инициализирован. Сначала вызовите init()');
    }
    return ZoneService.instance;
  }

  /**
   * Получить все зоны
   */
  public async getAllZones(): Promise<Region[][]> {
    return this.apiService.get<Region[][]>(this.endpoint);
  }

  /**
   * Получить зону фракции
   */
  public async getZoneByFaction(factionId: FactionId): Promise<Region[]> {
    return this.apiService.get<Region[]>(`${this.endpoint}/${factionId}`);
  }

  /**
   * Получить регионы зоны
   */
  public async getZoneRegions(factionId: FactionId): Promise<Region[]> {
    return this.apiService.get<Region[]>(`${this.endpoint}/${factionId}/regions`);
  }

  /**
   * Получить соседние регионы зоны
   */
  public async getZoneNeighbours(factionId: FactionId): Promise<Region[]> {
    return this.apiService.get<Region[]>(`${this.endpoint}/${factionId}/neighbours`);
  }
} 