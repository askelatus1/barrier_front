import { ApiService } from './api.service';

interface ChatEventMessage {
  title: string;
  description: string;
  type: 'START' | 'EVENT' | 'NOTIFY' | 'STOP';
  timestamp: string;
}

export class ChatEventService {
  private static instance: ChatEventService | null = null;
  private messages: ChatEventMessage[] = [];
  private readonly MAX_MESSAGES = 20;
  private chatContainer: HTMLElement | null = null;

  private constructor(
    private readonly apiService: ApiService
  ) {
    this.chatContainer = document.querySelector('chat-events');
  }

  public static init(apiService: ApiService): void {
    if (!ChatEventService.instance) {
      ChatEventService.instance = new ChatEventService(apiService);
    }
  }

  public static getInstance(): ChatEventService {
    if (!ChatEventService.instance) {
      throw new Error('ChatEventService не инициализирован. Сначала вызовите init()');
    }
    return ChatEventService.instance;
  }

  public addMessage(message: ChatEventMessage): void {
    this.messages.unshift(message);
    
    if (this.messages.length > this.MAX_MESSAGES) {
      this.messages.pop();
    }

    this.renderMessages();
  }

  public clearMessages(): void {
    this.messages = [];
    this.renderMessages();
  }

  private renderMessages(): void {
    if (!this.chatContainer) return;

    this.chatContainer.innerHTML = '';
    
    this.messages.forEach(message => {
      const chatEvent = document.createElement('chat-event');
      chatEvent.setAttribute('title', message.title);
      chatEvent.setAttribute('description', message.description);
      chatEvent.setAttribute('type', message.type);
      chatEvent.setAttribute('timestamp', message.timestamp);
      
      this.chatContainer?.appendChild(chatEvent);
    });
  }
} 