import chatEventStyles from '../styles/components/chat-event.css?inline';
import { SSEEventType } from '../models/constants';

class ChatEvent extends HTMLElement {
  static get observedAttributes() {
    return ['timestamp', 'title', 'description', 'type'];
  }

  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
  }

  connectedCallback() {
    if (!this.shadowRoot) return;
    this.render();
  }

  attributeChangedCallback() {
    if (!this.shadowRoot) return;
    this.render();
  }

  private getTypeStyle(type: string) {
    switch (type) {
      case SSEEventType.EVENT_CREATED:
      case SSEEventType.TRACK_CREATED:
      case SSEEventType.REGION_CREATED:
        return 'label-red';
      case SSEEventType.EVENT_UPDATED:
      case SSEEventType.TRACK_UPDATED:
      case SSEEventType.REGION_UPDATED:
        return 'label-yellow';
      case SSEEventType.EVENT_DELETED:
      case SSEEventType.REGION_DELETED:
        return 'label-blue';
      case SSEEventType.TRACK_STOPPED:
        return 'label-green';
      default:
        return 'label-gray';
    }
  }

  private getTypeIcon(type: string): string {
    switch (type) {
      case SSEEventType.EVENT_CREATED:
      case SSEEventType.TRACK_CREATED:
      case SSEEventType.REGION_CREATED:
        return `<svg width="44" height="44" viewBox="0 0 44 44" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="22" cy="22" r="20" stroke="#FF4D4F" stroke-width="2"/>
          <path d="M22 14V30M14 22H30" stroke="#FF4D4F" stroke-width="2" stroke-linecap="round"/>
        </svg>`;
      case SSEEventType.EVENT_UPDATED:
      case SSEEventType.TRACK_UPDATED:
      case SSEEventType.REGION_UPDATED:
        return `<svg width="44" height="44" viewBox="0 0 44 44" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="22" cy="22" r="20" stroke="#FAAD14" stroke-width="2"/>
          <path d="M22 16V22L26 26" stroke="#FAAD14" stroke-width="2" stroke-linecap="round"/>
        </svg>`;
      case SSEEventType.EVENT_DELETED:
      case SSEEventType.REGION_DELETED:
        return `<svg width="44" height="44" viewBox="0 0 44 44" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="22" cy="22" r="20" stroke="#1890FF" stroke-width="2"/>
          <path d="M22 16V22M22 28V28.01" stroke="#1890FF" stroke-width="2" stroke-linecap="round"/>
        </svg>`;
      case SSEEventType.TRACK_STOPPED:
        return `<svg width="44" height="44" viewBox="0 0 44 44" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="22" cy="22" r="20" stroke="#52C41A" stroke-width="2"/>
          <rect x="16" y="16" width="12" height="12" rx="2" stroke="#52C41A" stroke-width="2"/>
        </svg>`;
      default:
        return `<svg width="44" height="44" viewBox="0 0 44 44" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="22" cy="22" r="20" stroke="#8C8C8C" stroke-width="2"/>
          <path d="M22 16V28M16 22H28" stroke="#8C8C8C" stroke-width="2" stroke-linecap="round"/>
        </svg>`;
    }
  }

  private render() {
    if (!this.shadowRoot) return;
    const title = this.getAttribute('title') || '';
    const description = this.getAttribute('description') || '';
    const type = this.getAttribute('type') || '';
    const timestamp = this.getAttribute('timestamp') || '';

    const typeClass = this.getTypeStyle(type);
    const typeIcon = this.getTypeIcon(type);

    const formattedDateTime = timestamp ? new Date(timestamp).toLocaleString('ru-RU', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }) : '';

    this.shadowRoot.innerHTML = `
      <style>${chatEventStyles}</style>
      <div class="chatEvent">
        <div class="avatar-container">
          ${typeIcon}
        </div>
        <div class="content">
          <div class="header">
            <span class="title">${title}</span>
            <span class="label ${typeClass}">${type}</span>
          </div>
          <div class="description">${description}</div>
          <div class="timestamp">${formattedDateTime}</div>
        </div>
      </div>
    `;
  }
}

customElements.define('chat-event', ChatEvent); 