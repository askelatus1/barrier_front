import chatEventsStyles from '../styles/components/chat-events.css?inline';

class ChatEvents extends HTMLElement {
  private demoEvents = [
    {
      id: "1",
      timestamp: "2024-03-20 14:30:00", 
      text: "Игрок начал новую игру",
      description: "Новый игрок присоединился к серверу и начал игровую сессию. Статус активен.",
      isCompleted: true,
      eventType: "START"
    },
    {
      id: "2",
      timestamp: "2024-03-20 14:31:15",
      text: "Получено сообщение от сервера",
      description: "Сервер прислал обновление о состоянии игры. Обнаружена активность вражеской фракции.",
      isCompleted: true,
      eventType: "EVENT"
    },
    {
      id: "3", 
      timestamp: "2024-03-20 14:32:00",
      text: "Ожидание ответа от сервера...",
      description: "Отправлен запрос на сервер. Ожидание подтверждения действий игрока.",
      isCompleted: false,
      eventType: "NOTIFY"
    },
    {
      id: "4",
      timestamp: "2024-03-20 14:32:30",
      text: "Игра остановлена",
      description: "Игровая сессия завершена. Все прогресс сохранен.",
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
        description="${event.description}"
        type="${event.eventType}"
      ></chat-event>
    `).join('');

    this.shadowRoot.innerHTML = `
      <style>
        ${chatEventsStyles}
      </style>
      ${eventsHtml}
    `;
  }
}

customElements.define('chat-events', ChatEvents); 