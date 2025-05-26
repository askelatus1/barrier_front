import { ActorService } from '../api/actor.service';
import { RegionService } from '../api/region.service';
import { Faction } from '../../models/faction';
import { Region } from '../../models/region';

export class DataService {
  private static instance: DataService | null = null;
  private factions: Faction[] = [];
  private regions: Region[] = [];

  private constructor(
    private readonly actorService: ActorService,
    private readonly regionService: RegionService
  ) {}

  public static init(actorService: ActorService, regionService: RegionService): void {
    if (!DataService.instance) {
      DataService.instance = new DataService(actorService, regionService);
    }
  }

  public static getInstance(): DataService {
    if (!DataService.instance) {
      throw new Error('DataService не инициализирован. Сначала вызовите init()');
    }
    return DataService.instance;
  }

  /**
   * Загрузить все данные
   */
  public async loadAllData(): Promise<void> {
    await Promise.all([
      this.loadFactions(),
      this.loadRegions()
    ]);
  }

  /**
   * Загрузить фракции
   */
  public async loadFactions(): Promise<void> {
    this.factions = await this.actorService.getAllActors();
  }

  /**
   * Загрузить регионы
   */
  public async loadRegions(): Promise<void> {
    this.regions = await this.regionService.getAllRegions();
  }

  /**
   * Получить все фракции
   */
  public getFactions(): Faction[] {
    return [...this.factions];
  }

  /**
   * Получить все регионы
   */
  public getRegions(): Region[] {
    return [...this.regions];
  }

  /**
   * Получить фракцию по ID
   */
  public getFactionById(id: string): Faction | undefined {
    return this.factions.find(f => f.id === id);
  }

  /**
   * Получить регион по ID
   */
  public getRegionById(id: string): Region | undefined {
    return this.regions.find(r => r.id === id);
  }

  /**
   * Обновить фракцию
   */
  public async updateFaction(id: string, data: Partial<Faction>): Promise<void> {
    await this.actorService.updateActor(id, data);
    await this.loadFactions();
  }

  /**
   * Обновить регион
   */
  public async updateRegion(id: string, data: Partial<Region>): Promise<void> {
    await this.regionService.updateRegion(id, data);
    await this.loadRegions();
  }
} 