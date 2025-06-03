import { UIComponent, uiComponents } from '../../config/ui.config';
import { COLORS } from '../../styles/theme';
import { UiFaction } from '../../models/ui.types';
import { ActorService } from '../api/actor.service';
import { RegionService } from '../api/region.service';
import { EventService } from '../api/event.service';

export class UIService {
  private static instance: UIService;
  private componentModules = import.meta.glob('/src/components/*.ts', { eager: true });
  private components: UIComponent[] = uiComponents;
  private uiFactions: UiFaction[] = [];

  private constructor(
    private readonly actorService: ActorService,
    private readonly regionService: RegionService,
    private readonly eventService: EventService
  ) {
    this.validateComponents();
  }

  public static init(
    actorService: ActorService,
    regionService: RegionService,
    eventService: EventService
  ): void {
    if (!UIService.instance) {
      UIService.instance = new UIService(actorService, regionService, eventService);
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

  public async initialize(): Promise<void> {
    try {
      console.log('Initializing UI components...');
      await this.loadAllComponents();
      
      const template = this.createRootTemplate();
      this.mountToDOM(template);
      
      // Инициализируем UI с пустыми данными
      this.uiFactions = [];
      this.updateFactionsUI();
      
      console.log('UI initialization completed');
    } catch (error) {
      console.error('UI initialization failed:', error);
      throw error;
    }
  }

  public async loadInitialData(): Promise<void> {
    try {
      console.log('Loading initial data...');
      await this.loadFactions();
      console.log('Initial data loaded');
    } catch (error) {
      console.error('Failed to load initial data:', error);
      throw error;
    }
  }

  public async registerComponent(name: string, path: string): Promise<void> {
    const component = { name, path };
    this.components.push(component);
    await this.loadComponent(component);
  }

  private async loadFactions(): Promise<void> {
    try {
      const factions = await this.actorService.getAllActors();
      this.uiFactions = factions.map(faction => this.actorService.convertToUiFaction(faction));
      this.updateFactionsUI();
    } catch (error) {
      console.error('Failed to load factions:', error);
      this.uiFactions = [];
    }
  }

  private updateFactionsUI(): void {
    const factionsContainer = document.querySelector('game-card#app_factions');
    if (factionsContainer) {
      (factionsContainer as any).factions = this.uiFactions;
    }
  }

  public getFactions(): UiFaction[] {
    return [...this.uiFactions];
  }

  public async refreshFactions(): Promise<void> {
    await this.loadFactions();
  }

  public async refreshUI(): Promise<void> {
    // Обновляем фракции
    await this.loadFactions();
    
    // Здесь можно добавить обновление других UI компонентов по мере необходимости
    console.log('UI refreshed with new data');
  }
} 