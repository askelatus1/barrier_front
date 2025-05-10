import styles from './chat-event.css?inline';

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
      case 'START':
        return 'label-red';
      case 'EVENT':
        return 'label-yellow';
      case 'NOTIFY':
        return 'label-blue';
      case 'STOP':
        return 'label-green';
      default:
        return 'label-gray';
    }
  }

  private render() {
    if (!this.shadowRoot) return;
    const title = this.getAttribute('title') || '';
    const description = this.getAttribute('description') || '';
    const type = this.getAttribute('type') || '';
    const timestamp = this.getAttribute('timestamp') || '';

    const typeClass = this.getTypeStyle(type);
    const styleHref = new URL('./chat-event.css', import.meta.url).toString();

    const formattedDateTime = timestamp ? new Date(timestamp).toLocaleString('ru-RU', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }) : '';

    this.shadowRoot.innerHTML = `
      <style>${styles}</style>
      <link rel="stylesheet" href="${styleHref}">
      <div class="chatEvent">
        <div class="avatar-container">
          <img class="avatar" src="https://placehold.co/44x44" alt="avatar" />
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