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
import { SSEService } from './services/api/sse.service';
import { firstValueFrom } from 'rxjs';

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
      // Инициализация базовых сервисов
      const configService = ConfigService.getInstance();
      
      // Инициализация сервисов в правильном порядке
      const sseService = SSEService.getInstance();
      sseService.initialize();
      
      // Сначала инициализируем все базовые сервисы
      TrackService.init(this.apiService);
      EventService.init(this.apiService);
      RegionService.init(this.apiService);
      ZoneService.init(this.apiService);

      // Затем инициализируем сервисы с зависимостями
      ActorService.init(
        this.apiService,
        TrackService.getInstance(),
        EventService.getInstance(),
        sseService
      );

      // Инициализация UI сервисов
      UIService.init(
        ActorService.getInstance(),
        RegionService.getInstance(),
        EventService.getInstance()
      );

      const networkService = NetworkService.getInstance();
      
      console.log('Все сервисы успешно инициализированы');

      // Инициализация UI компонентов
      await UIService.getInstance().initialize();

      console.log('Starting data loading...');
      
      // Загрузка данных
      const [actors, events] = await Promise.all([
        ActorService.getInstance().getAllActors(),
        EventService.getInstance().getAllEvents()
      ]);
      console.log('Actors and events loaded');

      // Загрузка регионов
      await RegionService.getInstance().loadRegions();
      const regions = await firstValueFrom(RegionService.getInstance().getRegions());
      console.log('Regions loaded:', regions.length);

      if (!regions.length) {
        throw new Error('No regions loaded');
      }

      // Получаем отображаемые фракции через Observable
      const displayedFactions = await firstValueFrom(ActorService.getInstance().getDisplayedActors());
      UIService.getInstance().setFactions(Array.from(displayedFactions.values()));
      UIService.getInstance().setRegions(regions);
      console.log('UI updated with data');

      // Инициализация сети и обновление отображения
      await this.initializeNetwork();
      console.log('Network initialized');
      
      // Обновляем отображение сети
      await this.networkService.updateNetworkDisplay();
      console.log('Network display updated');

    } catch (error) {
      console.error('Failed to initialize services:', error);
      throw error;
    }
  }

  private async waitForElementInShadow(shadowRoot: ShadowRoot, selector: string): Promise<Element> {
    return new Promise((resolve, reject) => {
      const element = shadowRoot.querySelector(selector);
      if (element) {
        resolve(element);
        return;
      }

      const observer = new MutationObserver((mutations, obs) => {
        const element = shadowRoot.querySelector(selector);
        if (element) {
          obs.disconnect();
          resolve(element);
        }
      });

      observer.observe(shadowRoot, {
        childList: true,
        subtree: true
      });

      // Таймаут на случай, если элемент не появится
      setTimeout(() => {
        observer.disconnect();
        reject(new Error(`Element ${selector} not found in shadow root`));
      }, 5000);
    });
  }

  private async initializeNetwork(): Promise<void> {
    try {
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
        const mapCanvas = await this.waitForElementInShadow(cardShadow, '#app_map_canvas');
        console.log('Map canvas container found:', mapCanvas);
        
        // Инициализация сети
        this.networkService.initialize(mapCanvas as HTMLElement);
        console.log('Network service initialized');
      } catch (e) {
        console.error('Failed to initialize network:', e);
        throw e;
      }
    } catch (error) {
      console.error('Failed to initialize network:', error);
      throw error;
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