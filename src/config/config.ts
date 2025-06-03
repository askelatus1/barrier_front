export interface ApiConfig {
  baseUrl: string;
  headers: Record<string, string>;
  timeout: number;
}

export interface SSEConfig {
  reconnectDelayMs: number;
}

export interface AppConfig {
  api: ApiConfig;
  sse: SSEConfig;
  env: string;
  debug: boolean;
}

// Конфигурация по умолчанию
const defaultConfig: AppConfig = {
  api: {
    baseUrl: 'http://localhost:3000/api',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    },
    timeout: 30000
  },
  sse: {
    reconnectDelayMs: 5000
  },
  env: 'development',
  debug: false
};

export default defaultConfig; 