import { UIComponent, uiComponents } from '../../config/ui.config';

export class UIService {
  private static instance: UIService;
  private componentModules = import.meta.glob('/src/components/*.ts', { eager: true });
  private components: UIComponent[] = uiComponents;

  private constructor() {
    this.validateComponents();
  }

  private validateComponents(): void {
    const missingComponents = this.components.filter(
      component => !this.componentModules[`${component.path}.ts`]
    );

    if (missingComponents.length > 0) {
      console.warn('Missing components:', missingComponents);
    }
  }

  public static getInstance(): UIService {
    if (!UIService.instance) {
      UIService.instance = new UIService();
    }
    return UIService.instance;
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
    template.innerHTML = `<game-container></game-container>`;
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
      
      console.log('UI initialization completed');
    } catch (error) {
      console.error('UI initialization failed:', error);
      throw error;
    }
  }

  public async registerComponent(name: string, path: string): Promise<void> {
    const component = { name, path };
    this.components.push(component);
    await this.loadComponent(component);
  }
} 