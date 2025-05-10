class ChatEvents extends HTMLElement {
  private demoEvents = [
    {
      id: "1",
      timestamp: "2024-03-20 14:30:00",
      text: "Игрок начал новую игру",
      isCompleted: true,
      eventType: "START"
    },
    {
      id: "2",
      timestamp: "2024-03-20 14:31:15",
      text: "Получено сообщение от сервера",
      isCompleted: true,
      eventType: "EVENT"
    },
    {
      id: "3",
      timestamp: "2024-03-20 14:32:00",
      text: "Ожидание ответа от сервера...",
      isCompleted: false,
      eventType: "NOTIFY"
    },
    {
      id: "4",
      timestamp: "2024-03-20 14:32:30",
      text: "Игра остановлена",
      isCompleted: true,
      eventType: "STOP"
    }
  ];

  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
  }

  connectedCallback() {
    if (!this.shadowRoot) return;
    this.render();
  }

  private render() {
    if (!this.shadowRoot) return;

    const eventsHtml = this.demoEvents.map(event => `
      <chat-event
        timestamp="${event.timestamp}"
        title="${event.text}"
        description="Пробраться в пещеру где великан держит свой тайник и достать ключ в качестве трофея\nвторая строка ...на всякий случай"
        type="${event.eventType}"
      ></chat-event>
    `).join('');

    this.shadowRoot.innerHTML = `
      <style>
        :host {
          display: flex;
          flex-direction: column;
          gap: 8px;
          padding: 16px;
          height: 100%;
          overflow-y: auto;
          box-sizing: border-box;
        }
      </style>
      ${eventsHtml}
    `;
  }
}

customElements.define('chat-events', ChatEvents); 