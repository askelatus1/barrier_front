import { ConfigService } from './src/services/config/config.service';
import { ApiService } from './src/services/api/api.service';
import { UIService } from './src/services/ui/ui.service';

// Инициализация сервисов
const configService = ConfigService.getInstance();
const apiService = new ApiService();
const uiService = UIService.getInstance();

// Экспортируем сервисы для использования в приложении
export {
  configService,
  apiService,
  uiService
};

// Инициализация приложения
async function bootstrap() {
  try {
    console.log('Application started');
    console.log('Current config:', configService.getConfig());
    
    // Инициализация UI
    await uiService.initialize();
    
    console.log('Application bootstrap completed');
  } catch (error) {
    console.error('Application bootstrap failed:', error);
  }
}

// Запускаем приложение
bootstrap(); 