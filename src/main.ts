import './styles/global.css';
import { ConfigService } from './services/config/config.service';
import { ApiService } from './services/api/api.service';
import { ActorService } from './services/api/actor.service';
import { RegionService } from './services/api/region.service';
import { EventService } from './services/api/event.service';
import { ZoneService } from './services/api/zone.service';
import { UIService } from './services/ui/ui.service';
import { NetworkService } from './services/ui/network.service';
import { TrackService } from './services/api/track.service';

class App {
  private static instance: App | null = null;
  private apiService: ApiService;
  private configService = ConfigService.getInstance();
  private networkService = NetworkService.getInstance();

  private constructor() {
    this.apiService = new ApiService();
  }

  public static getInstance(): App {
    if (!App.instance) {
      App.instance = new App();
    }
    return App.instance;
  }

  private async initializeServices(): Promise<void> {
    try {
      // Инициализация API сервисов
      RegionService.init(this.apiService);
      ActorService.init(this.apiService);
      EventService.init(this.apiService);
      ZoneService.init(this.apiService);
      TrackService.init(this.apiService);

      // Инициализация UI с пустыми данными
      UIService.init(
        ActorService.getInstance(),
        RegionService.getInstance(),
        EventService.getInstance()
      );

      // Инициализация UI компонентов
      await UIService.getInstance().initialize();

      console.log('Starting data loading...');
      
      // Загрузка данных
      const [actors, events] = await Promise.all([
        ActorService.getInstance().getAllActors(),
        EventService.getInstance().getAllEvents()
      ]);
      console.log('Actors and events loaded');

      // Загрузка регионов в кэш
      await RegionService.getInstance().loadRegions();
      const regions = RegionService.getInstance().getRegions();
      
      if (!regions.length) {
        throw new Error('No regions loaded');
      }
      console.log('Regions loaded:', regions.length);

      // Преобразование и обновление UI данными
      const uiFactions = actors.map(actor => ActorService.getInstance().convertToUiFaction(actor));
      UIService.getInstance().setFactions(uiFactions);
      UIService.getInstance().setRegions(regions);
      console.log('UI updated with data');

      // Инициализация сети и обновление отображения
      await this.initializeNetwork();
      console.log('Network initialized');
      
      await this.networkService.updateNetworkDisplay();
      console.log('Network display updated');
    } catch (error) {
      console.error('Failed to initialize services:', error);
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

  private async initializeNetwork(): Promise<void> {
    console.log('Starting network initialization...');
    const mapContainer = document.querySelector('game-card#app_map');
    if (!mapContainer) {
      throw new Error('mapContainer component not found');
    }
    console.log('Map container found');

    // Ждем инициализации Shadow DOM
    await new Promise(resolve => setTimeout(resolve, 100));
    console.log('Shadow DOM initialization delay completed');
    
    // Ждем появления div-контейнера для карты во вложенном shadowRoot
    const cardShadow = mapContainer.shadowRoot;
    if (!cardShadow) throw new Error('No shadowRoot in game-card#app_map');
    console.log('Shadow root found');
    
    try {
      const mapContainer = await this.waitForElementInShadow(cardShadow, '#app_map_canvas');
      console.log('Map canvas container found:', mapContainer);
      
      // Инициализация сети
      this.networkService.initialize(mapContainer as HTMLElement);
      console.log('Network service initialized');
    } catch (e) {
      console.error('Failed to initialize network:', e);
      throw e;
    }
  }

  public async initialize(): Promise<void> {
    try {
      console.log('Initializing application...');
      console.log('Current config:', this.configService.getConfig());
      
      // Инициализация сервисов и UI
      await this.initializeServices();
      
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