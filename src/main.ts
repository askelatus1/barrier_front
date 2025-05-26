import './styles/global.css';
import { ConfigService } from './services/config/config.service';
import { ApiService } from './services/api/api.service';
import { ActorService } from './services/api/actor.service';
import { RegionService } from './services/api/region.service';
import { EventService } from './services/api/event.service';
import { ZoneService } from './services/api/zone.service';
import { DataService } from './services/data/data.service';
import { UIService } from './services/ui/ui.service';
import { NetworkService } from './services/ui/network.service';
import { demoNodes, demoEdges } from './services/ui/network-demo.data';

class App {
  private static instance: App | null = null;
  private apiService: ApiService | null = null;
  private configService = ConfigService.getInstance();
  private networkService = NetworkService.getInstance();

  private constructor() {}

  public static getInstance(): App {
    if (!App.instance) {
      App.instance = new App();
    }
    return App.instance;
  }

  private async initializeServices(): Promise<void> {
    // Инициализация API сервисов
    this.apiService = new ApiService();
    RegionService.init(this.apiService);
    ActorService.init(this.apiService);
    EventService.init(this.apiService);
    ZoneService.init(this.apiService);

    // Инициализация DataService
    DataService.init(
      ActorService.getInstance(),
      RegionService.getInstance()
    );

    // Загрузка данных
    await DataService.getInstance().loadAllData();

    // Инициализация UI
    UIService.init(
      DataService.getInstance(),
      ActorService.getInstance()
    );
  }

  private async waitForElementInShadow(shadowRoot: ShadowRoot, selector: string, timeout = 3000): Promise<HTMLElement> {
    return new Promise((resolve, reject) => {
      const el = shadowRoot.querySelector(selector);
      if (el) return resolve(el as HTMLElement);

      const observer = new MutationObserver(() => {
        const el = shadowRoot.querySelector(selector);
        if (el) {
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

  private async initializeNetwork(): Promise<void> {
    const mapContainer = document.querySelector('game-card#app_map');
    if (!mapContainer) {
      throw new Error('mapContainer component not found');
    }

    // Ждем инициализации Shadow DOM
    await new Promise(resolve => setTimeout(resolve, 100));
    
    // Ждем появления div-контейнера для карты во вложенном shadowRoot
    const cardShadow = mapContainer.shadowRoot;
    if (!cardShadow) throw new Error('No shadowRoot in game-card#app_map');
    
    try {
      const mapContainer = await this.waitForElementInShadow(cardShadow, '#app_map_canvas');
      console.log('MapContainer:', mapContainer);
      
      // Инициализация сети с демо-данными
      this.networkService.initialize(mapContainer as HTMLElement);
      this.networkService.setNodes(demoNodes);
      this.networkService.setEdges(demoEdges);

      // Загрузка реальных данных регионов
      const regions = await RegionService.getInstance().getAllRegions();
      console.log('Regions:', regions);
      const networkData = RegionService.convertToNetworkStructure(regions);
      this.networkService.setNodes(networkData.nodes);
      this.networkService.setEdges(networkData.edges);
    } catch (e) {
      console.error('Failed to initialize network:', e);
    }
  }

  public async initialize(): Promise<void> {
    try {
      console.log('Initializing application...');
      console.log('Current config:', this.configService.getConfig());
      
      // Инициализация сервисов
      await this.initializeServices();
      
      // Инициализация UI компонентов
      await UIService.getInstance().initialize();
      
      // Инициализация фракций
      const factionsContainer = document.querySelector('game-card#app_factions');
      if (factionsContainer) {
        (factionsContainer as any).factions = UIService.getInstance().getFactions();
      }

      // Инициализация сети
      await this.initializeNetwork();
      
      console.log('Application initialized successfully');
    } catch (error) {
      console.error('Failed to initialize application:', error);
      throw error;
    }
  }
}

// Запуск приложения
App.getInstance().initialize().catch(error => {
  console.error('Application failed to start:', error);
}); 