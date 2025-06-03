import { UIComponent, uiComponents } from '../../config/ui.config';
import { COLORS } from '../../styles/theme';
import { UiFaction } from '../../models/ui.types';
import { ActorService } from '../api/actor.service';
import { RegionService } from '../api/region.service';
import { EventService } from '../api/event.service';
import { TrackService } from '../api/track.service';
import { Region } from '../../models/region';
import { BarrierEvent } from '../../models/events';
import { combineLatest } from 'rxjs';
import { NetworkService } from './network.service';

export class UIService {
  private static instance: UIService;
  private componentModules = import.meta.glob('/src/components/*.ts', { eager: true });
  private components: UIComponent[] = uiComponents;
  private uiFactions: UiFaction[] = [];
  private regions: Region[] = [];
  private isNetworkInitialized = false;

  private constructor(
    private readonly actorService: ActorService,
    private readonly regionService: RegionService,
    private readonly eventService: EventService,
    private readonly trackService: TrackService
  ) {
    this.validateComponents();
  }

  public static init(
    actorService: ActorService,
    regionService: RegionService,
    eventService: EventService
  ): void {
    if (!UIService.instance) {
      UIService.instance = new UIService(
        actorService,
        regionService,
        eventService,
        TrackService.getInstance()
      );
    }
  }

  public static getInstance(): UIService {
    if (!UIService.instance) {
      throw new Error('UIService не инициализирован. Сначала вызовите init()');
    }
    return UIService.instance;
  }

  private validateComponents(): void {
    const missingComponents = this.components.filter(
      component => !this.componentModules[`${component.path}.ts`]
    );

    if (missingComponents.length > 0) {
      console.warn('Missing components:', missingComponents);
    }
  }

  private async loadComponent(component: UIComponent): Promise<void> {
    try {
      const modulePath = `${component.path}.ts`;
      if (!this.componentModules[modulePath]) {
        throw new Error(`Component module not found: ${modulePath}`);
      }
      console.log(`Component ${component.name} loaded successfully`);
    } catch (error) {
      console.error(`Failed to load component ${component.name}:`, error);
      throw error;
    }
  }

  private async loadAllComponents(): Promise<void> {
    const loadPromises = this.components.map(component => this.loadComponent(component));
    await Promise.all(loadPromises);
  }

  private createRootTemplate(): HTMLTemplateElement {
    const template = document.createElement('template');
    template.innerHTML = `<game-container>
        <game-card
          slot="map"
          id='app_map' 
          class="top-card"
          bg="${COLORS.background.secondary}"
          border="${COLORS.border.primary}">
        </game-card>
        
        <game-card
          slot="chat"
          id="chat"
          bg="${COLORS.background.tertiary}"
          border="${COLORS.border.secondary}">
        </game-card>
        
        <game-card
          slot="factions"
          id="app_factions"
          bg="${COLORS.background.quaternary}"
          border="${COLORS.border.tertiary}">
        </game-card>
    </game-container>`;
    return template;
  }

  private mountToDOM(template: HTMLTemplateElement): void {
    const appContainer = document.getElementById('app');
    if (!appContainer) {
      throw new Error('App container not found');
    }
    appContainer.appendChild(template.content.cloneNode(true));
  }

  private initializeSubscriptions(): void {
    // Комбинируем все потоки для обновления UI
    combineLatest([
      this.regionService.getRegions(),
      this.eventService.getEvents(),
      this.trackService.getTracks()
    ]).subscribe(async ([regions]) => {
      // Обновляем регионы
      this.regions = regions;
      this.updateRegionsUI();

      // Обновляем отображение сети только если она инициализирована
      if (this.isNetworkInitialized) {
        await this.updateNetworkDisplay();
      }
    });
  }

  private async updateNetworkDisplay(): Promise<void> {
    if (!this.isNetworkInitialized) return;

    try {
      const { nodes, edges } = await RegionService.convertToNetworkStructure(this.regions);
      const networkService = NetworkService.getInstance();
      
      // Очищаем старые данные
      networkService.clear();
      
      // Добавляем новые узлы и рёбра
      networkService.setNodes(nodes);
      networkService.setEdges(edges);
      
      console.log('Network display updated successfully');
    } catch (error) {
      console.error('Ошибка при обновлении отображения сети:', error);
    }
  }

  private updateFactionsUI(): void {
    const factionsContainer = document.querySelector('game-card#app_factions');
    if (!factionsContainer) return;
    (factionsContainer as any).factions = this.uiFactions;
  }

  private updateRegionsUI(): void {
    const mapContainer = document.querySelector('game-card#app_map');
    if (!mapContainer) return;
    (mapContainer as any).regions = this.regions;
  }

  public async initialize(): Promise<void> {
    try {
      console.log('Initializing UI components...');
      await this.loadAllComponents();
      
      const template = this.createRootTemplate();
      this.mountToDOM(template);
      
      // Инициализируем UI с пустыми данными
      this.uiFactions = [];
      this.regions = [];
      this.updateFactionsUI();
      this.updateRegionsUI();

      // Ждем инициализации Shadow DOM
      await new Promise(resolve => setTimeout(resolve, 100));
      console.log('Shadow DOM initialization delay completed');

      // Инициализируем сеть
      const mapContainer = document.querySelector('game-card#app_map');
      if (!mapContainer) {
        throw new Error('Map container not found');
      }

      // Ждем появления div-контейнера для карты во вложенном shadowRoot
      const cardShadow = mapContainer.shadowRoot;
      if (!cardShadow) throw new Error('No shadowRoot in game-card#app_map');
      console.log('Shadow root found');

      const mapCanvas = await this.waitForElementInShadow(cardShadow, '#app_map_canvas');
      console.log('Map canvas container found:', mapCanvas);

      const networkService = NetworkService.getInstance();
      networkService.initialize(mapCanvas as HTMLElement);
      this.isNetworkInitialized = true;

      // После инициализации сети подписываемся на обновления
      this.initializeSubscriptions();
      
      console.log('UI initialization completed');
    } catch (error) {
      console.error('UI initialization failed:', error);
      throw error;
    }
  }

  private async waitForElementInShadow(shadowRoot: ShadowRoot, selector: string, timeout = 3000): Promise<HTMLElement> {
    return new Promise((resolve, reject) => {
      const el = shadowRoot.querySelector(selector);
      if (el) {
        console.log(`Element ${selector} found immediately`);
        return resolve(el as HTMLElement);
      }

      console.log(`Waiting for element ${selector}...`);
      const observer = new MutationObserver(() => {
        const el = shadowRoot.querySelector(selector);
        if (el) {
          console.log(`Element ${selector} found after mutation`);
          observer.disconnect();
          resolve(el as HTMLElement);
        }
      });

      observer.observe(shadowRoot, { childList: true, subtree: true });

      setTimeout(() => {
        observer.disconnect();
        reject(new Error(`Timeout: ${selector} not found in shadowRoot`));
      }, timeout);
    });
  }

  public async registerComponent(name: string, path: string): Promise<void> {
    const component = { name, path };
    this.components.push(component);
    await this.loadComponent(component);
  }

  // Методы для работы с фракциями
  public setFactions(factions: UiFaction[]): void {
    this.uiFactions = factions;
    this.updateFactionsUI();
  }

  public getFactions(): UiFaction[] {
    return [...this.uiFactions];
  }

  // Методы для работы с регионами
  public setRegions(regions: Region[]): void {
    this.regions = regions;
    this.updateRegionsUI();
  }

  public getRegions(): Region[] {
    return [...this.regions];
  }
} 