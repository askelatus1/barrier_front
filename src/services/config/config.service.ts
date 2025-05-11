import defaultConfig, { AppConfig } from '../../config/config';

export class ConfigService {
  private static instance: ConfigService;
  private config: AppConfig;

  private constructor() {
    this.config = { ...defaultConfig };
    this.loadConfig();
  }

  public static getInstance(): ConfigService {
    if (!ConfigService.instance) {
      ConfigService.instance = new ConfigService();
    }
    return ConfigService.instance;
  }

  private async loadConfig(): Promise<void> {
    try {
      // Здесь можно загрузить конфигурацию с сервера или из localStorage
      const savedConfig = localStorage.getItem('appConfig');
      if (savedConfig) {
        this.config = { ...this.config, ...JSON.parse(savedConfig) };
      }
    } catch (error) {
      console.error('Failed to load config:', error);
    }
  }

  public getConfig(): AppConfig {
    return { ...this.config };
  }

  public getApiConfig() {
    return { ...this.config.api };
  }

  public updateConfig(newConfig: Partial<AppConfig>): void {
    this.config = { ...this.config, ...newConfig };
    // Сохраняем изменения
    localStorage.setItem('appConfig', JSON.stringify(this.config));
  }

  public resetConfig(): void {
    this.config = { ...defaultConfig };
    localStorage.removeItem('appConfig');
  }
} 