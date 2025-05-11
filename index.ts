import './src/styles/global.css';
import { ConfigService } from './src/services/config/config.service';
import { ApiService } from './src/services/api/api.service';
import { UIService } from './src/services/ui/ui.service';
import { NetworkService } from './src/services/ui/network.service';
import { demoNodes, demoEdges } from './src/services/ui/network-demo.data';
import { RegionService } from './src/services/api/region.service';

// Инициализация сервисов
const configService = ConfigService.getInstance();
const apiService = new ApiService();
const uiService = UIService.getInstance();
const networkService = NetworkService.getInstance();

// Инициализируем сервисы
RegionService.init(apiService);

// Ожидание появления элемента в shadowRoot
function waitForElementInShadow(shadowRoot: ShadowRoot, selector: string, timeout = 3000): Promise<HTMLElement> {
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

// Инициализация приложения
async function bootstrap() {
  try {
    console.log('Application started');
    console.log('Current config:', configService.getConfig());
    
    // Инициализация UI
    await uiService.initialize();
    
    // Ждем загрузки компонента GameContainer
    const mapContainer = document.querySelector('game-card#app_map');
    console.log('mapContainer:', mapContainer);
    
    if (!mapContainer) {
      throw new Error('mapContainer component not found');
    }

    // Ждем инициализации Shadow DOM
    await new Promise(resolve => setTimeout(resolve, 100));
    
    // Ждем появления div-контейнера для карты во вложенном shadowRoot
    const cardShadow = mapContainer.shadowRoot;
    if (!cardShadow) throw new Error('No shadowRoot in game-card#app_map');
    try {
      const mapContainer = await waitForElementInShadow(cardShadow, '#app_map_canvas');
      console.log('MapContainer:', mapContainer);
      networkService.initialize(mapContainer as HTMLElement);
      networkService.setNodes(demoNodes);
      networkService.setEdges(demoEdges);
    } catch (e) {
      console.error(e);
    }
    
    const regions = await RegionService.getInstance().getAllRegions();
    console.log('Regions:', regions);
    const networkData = RegionService.convertToNetworkStructure(regions);
    networkService.setNodes(networkData.nodes);
    networkService.setEdges(networkData.edges);

    console.log('Application bootstrap completed');
  } catch (error) {
    console.error('Application bootstrap failed:', error);
  }
}

// Запускаем приложение
bootstrap(); 