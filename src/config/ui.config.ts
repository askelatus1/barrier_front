export interface UIComponent {
  name: string;
  path: string;
}

export const uiComponents: UIComponent[] = [
  { name: 'game-header', path: '/src/components/game-header' },
  { name: 'game-card', path: '/src/components/game-card' },
  { name: 'game-container', path: '/src/components/game-container' },
  { name: 'chat-event', path: '/src/components/chat-event' },
  { name: 'chat-events', path: '/src/components/chat-events' },
  { name: 'faction-panel', path: '/src/components/faction-panel' }
]; 